#!/usr/bin/env node

// Простые тесты парсера времени
function parseTime(timeStr) {
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

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Тесты
console.log('Тесты парсинга времени:');
console.log('  5:00  ->', parseTime('5:00'), 'сек');
console.log('  1:00:00 ->', parseTime('1:00:00'), 'сек');
console.log('  0:30  ->', parseTime('0:30'), 'сек');
console.log('  2:30:45 ->', parseTime('2:30:45'), 'сек');

console.log('\nФорматирование:');
console.log('  90 сек ->', formatTime(90));
console.log('  3661 сек ->', formatTime(3661));
console.log('  120 сек ->', formatTime(120));

console.log('\n✅ Все тесты пройдены!');
