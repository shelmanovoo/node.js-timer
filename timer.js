#!/usr/bin/env node

const chalk = require('chalk');
const cliProgress = require('cli-progress');
const { execSync } = require('child_process');
const { Notification } = require('node-notifier');
const path = require('path');
const os = require('os');

// Файлы со звуками (можно заменить на свои)
const SOUND_FILES = [
  path.join(__dirname, 'sounds', 'alarm.mp3'),
  path.join(__dirname, 'sounds', 'bell.wav'),
  '/System/Library/Sounds/Glass.aiff', // macOS по умолчанию
  '/usr/share/sounds/alsa/Front_Center.wav' // Linux по умолчанию
];

class Timer {
  constructor() {
    this.totalSeconds = 0;
    this.elapsedSeconds = 0;
    this.isRunning = false;
    this.timerId = null;
    this.progressBar = null;
    this.notifyMessage = '';
    this.playSound = false;
    this.targetTime = '';
  }

  // Парсинг времени: mm:ss или hh:mm:ss
  parseTime(timeStr) {
    const parts = timeStr.split(':').map(Number);
    
    if (parts.length === 2) {
      const [minutes, seconds] = parts;
      if (minutes < 0 || seconds < 0 || seconds >= 60) {
        throw new Error('Неверный формат времени: mm:ss (0-59 сек)');
      }
      return minutes * 60 + seconds;
    } else if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      if (hours < 0 || minutes < 0 || seconds < 0 || minutes >= 60 || seconds >= 60) {
        throw new Error('Неверный формат времени: hh:mm:ss (0-59 мин/сек)');
      }
      return hours * 3600 + minutes * 60 + seconds;
    } else {
      throw new Error('Неверный формат времени. Используйте mm:ss или hh:mm:ss');
    }
  }

  // Форматирование секунд в hh:mm:ss
  formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // Экспорт для тестирования
  static parseTimeStatic(timeStr) {
    const parts = timeStr.split(':').map(Number);
    
    if (parts.length === 2) {
      const [minutes, seconds] = parts;
      if (minutes < 0 || seconds < 0 || seconds >= 60) {
        throw new Error('Неверный формат времени: mm:ss (0-59 сек)');
      }
      return minutes * 60 + seconds;
    } else if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      if (hours < 0 || minutes < 0 || seconds < 0 || minutes >= 60 || seconds >= 60) {
        throw new Error('Неверный формат времени: hh:mm:ss (0-59 мин/сек)');
      }
      return hours * 3600 + minutes * 60 + seconds;
    } else {
      throw new Error('Неверный формат времени. Используйте mm:ss или hh:mm:ss');
    }
  }

  static formatTimeStatic(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // Статические методы для тестов
  static formatTime(seconds) {
    return this.formatTimeStatic(seconds);
  }

  static parseTime(timeStr) {
    return this.parseTimeStatic(timeStr);
  }

  // Попытка воспроизвести звук
  playAlertSound() {
    if (!this.playSound) return;
    
    for (const soundFile of SOUND_FILES) {
      try {
        execSync(`afplay "${soundFile}" 2>/dev/null`, { stdio: 'ignore' });
        return;
      } catch (e) {
        try {
          execSync(`mpg123 -q "${soundFile}" 2>/dev/null`, { stdio: 'ignore' });
          return;
        } catch (e2) {
          continue;
        }
      }
    }
    console.log(chalk.yellow('\n⚠ Звук не воспроизведен: файл не найден'));
  }

  // Отправка системного уведомления
  sendNotification() {
    if (!this.notifyMessage) return;
    
    const notifier = new Notification();
    notifier.notify({
      title: '⏰ Таймер завершен!',
      message: this.notifyMessage,
      icon: path.join(__dirname, 'icon.png'),
      sound: true
    }, (err) => {
      if (err) {
        console.log(chalk.yellow(`\n⚠ Уведомление не отправлено: ${err.message}`));
      }
    });
  }

  // Обратный отсчет
  startCountdown() {
    this.totalSeconds = this.parseTime(this.targetTime);
    this.elapsedSeconds = 0;
    
    console.log(chalk.cyan(`\n⏱️  Запуск обратного таймера: ${this.formatTime(this.totalSeconds)}\n`));
    
    this.progressBar = new cliProgress.Bar({
      format: ' [{bar}] {percentage}% | {value}s / {total}s | {timer}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true
    }, cliProgress.Presets.shades_classic);
    
    this.progressBar.start(this.totalSeconds, 0, { timer: this.formatTime(this.totalSeconds) });
    
    this.timerId = setInterval(() => {
      this.elapsedSeconds++;
      const remaining = this.totalSeconds - this.elapsedSeconds;
      
      if (remaining < 0) {
        this.finishTimer();
      } else {
        this.progressBar.update(this.elapsedSeconds, { timer: this.formatTime(remaining) });
      }
    }, 1000);
  }

  // Секундомер
  startStopwatch() {
    console.log(chalk.green('\n⏱️  Запуск секундомера\n'));
    
    this.progressBar = new cliProgress.Bar({
      format: ' ⏱️  {value} | {timer}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true
    }, cliProgress.Presets.shades_classic);
    
    this.progressBar.start(100, 0, { timer: '00:00:00' });
    
    this.timerId = setInterval(() => {
      this.elapsedSeconds++;
      this.progressBar.update(this.elapsedSeconds, { timer: this.formatTime(this.elapsedSeconds) });
    }, 1000);
  }

  // Завершение
  finishTimer() {
    clearInterval(this.timerId);
    this.progressBar.stop();
    
    console.log('\n');
    console.log(chalk.green('✅ Таймер завершен!'));
    
    this.playAlertSound();
    this.sendNotification();
    
    process.exit(0);
  }

  // Сброс таймера
  reset() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.progressBar) {
      this.progressBar.stop();
    }
    this.elapsedSeconds = 0;
    console.log(chalk.yellow('\n🔄 Таймер сброшен'));
  }

  // Обработка сигналов
  setupSignalHandlers() {
    process.on('SIGINT', () => {
      console.log('\n');
      this.reset();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      this.reset();
      process.exit(0);
    });
  }
}

// Парсинг аргументов командной строки
function parseArgs() {
  const args = process.argv.slice(2);
  
  const options = {
    countdown: null,
    stopwatch: false,
    notify: '',
    sound: false
  };
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--countdown':
        options.countdown = args[++i];
        break;
      case '--stopwatch':
        options.stopwatch = true;
        break;
      case '--notify':
        options.notify = args[++i];
        break;
      case '--sound':
        options.sound = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Usage: node timer.js [options]

Options:
  --countdown <time>  Обратный отсчет (mm:ss или hh:mm:ss)
  --stopwatch         Запустить секундомер
  --notify <message>  Системное уведомление при завершении
  --sound             Воспроизвести звук при завершении
  --help, -h          Показать справку

Examples:
  node timer.js --countdown 5:00
  node timer.js --countdown 1:30:00
  node timer.js --stopwatch
  node timer.js --countdown 0:30 --notify "Время вышло!"
`);
        process.exit(0);
    }
  }
  
  return options;
}

// Главная функция
function main() {
  const options = parseArgs();
  
  if (!options.countdown && !options.stopwatch) {
    console.log(chalk.red('\n❌ Укажите режим: --countdown <time> или --stopwatch'));
    console.log('Используйте --help для справки\n');
    process.exit(1);
  }
  
  if (options.countdown && options.stopwatch) {
    console.log(chalk.red('\n❌ Выберите только один режим: таймер или секундомер\n'));
    process.exit(1);
  }
  
  const timer = new Timer();
  timer.notifyMessage = options.notify;
  timer.playSound = options.sound;
  timer.targetTime = options.countdown;
  
  timer.setupSignalHandlers();
  
  if (options.countdown) {
    timer.startCountdown();
  } else {
    timer.startStopwatch();
  }
}

main();
