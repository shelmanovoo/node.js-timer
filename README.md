# Таймер/секундомер на Node.js

Простое консольное приложение для отсчета времени с напоминаниями.

## Функции

- Обратный отсчет по заданной длительности
- Секундомер — отсчет времени с момента запуска
- Поддержка форматов: `mm:ss`, `hh:mm:ss`
- Звуковое напоминание при завершении (опционально)
- Уведомления системы (macOS/Windows/Linux)
<img width="577" height="252" alt="image" src="https://github.com/user-attachments/assets/1d52e0df-55a4-496f-a946-460d77c96fd1" />


## Установка

```bash
mkdir timer && cd timer
npm init -y
npm install chalk cli-progress node-notifier
```

## Запуск

```bash
# Обратный таймер на 5 минут
node timer.js --countdown 5:00

# Обратный таймер на 1 час 30 минут
node timer.js --countdown 1:30:00

# Секундомер
node timer.js --stopwatch

# Таймер с напоминанием через 30 секунд
node timer.js --countdown 0:30 --notify "Проверить духовку"
```

## Опции

- `--countdown <time>` — задать длительность в формате `mm:ss` или `hh:mm:ss`
- `--stopwatch` — запустить секундомер
- `--notify <message>` — отправить системное уведомление при завершении
- `--sound` — воспроизвести звук при завершении (опционально, требует `afplay`/`mpg123`)

## Требования

- Node.js ≥ 16.x
- Для уведомлений: `node-notifier` (работает на macOS/Windows/Linux)
- Для звука: `afplay` (macOS) или `mpg123` (Linux/Windows)
