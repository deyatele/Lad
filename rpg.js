'use strict';
const monsterObj = {
  maxHealth: 10,
  name: 'Лютый',
  moves: [
    {
      name: 'Удар когтистой лапой',
      physicalDmg: 3, // физический урон
      magicDmg: 0, // магический урон
      physicArmorPercents: 20, // физическая броня
      magicArmorPercents: 20, // магическая броня
      cooldown: 0, // ходов на восстановление
      timeCooldown: 0,
    },
    {
      name: 'Огненное дыхание',
      physicalDmg: 0,
      magicDmg: 4,
      physicArmorPercents: 0,
      magicArmorPercents: 0,
      cooldown: 3,
      timeCooldown: 0,
    },
    {
      name: 'Удар хвостом',
      physicalDmg: 2,
      magicDmg: 0,
      physicArmorPercents: 50,
      magicArmorPercents: 0,
      cooldown: 2,
      timeCooldown: 0,
    },
  ],
};
const magObj = {
  maxHealth: 10,
  name: 'Евстафий',
  moves: [
    {
      name: 'Удар боевым кадилом',
      physicalDmg: 2,
      magicDmg: 0,
      physicArmorPercents: 0,
      magicArmorPercents: 50,
      cooldown: 0,
      timeCooldown: 0,
    },
    {
      name: 'Вертушка левой пяткой',
      physicalDmg: 4,
      magicDmg: 0,
      physicArmorPercents: 0,
      magicArmorPercents: 0,
      cooldown: 4,
      timeCooldown: 0,
    },
    {
      name: 'Каноничный фаербол',
      physicalDmg: 0,
      magicDmg: 5,
      physicArmorPercents: 0,
      magicArmorPercents: 0,
      cooldown: 3,
      timeCooldown: 0,
    },
    {
      name: 'Магический блок',
      physicalDmg: 0,
      magicDmg: 0,
      physicArmorPercents: 100,
      magicArmorPercents: 100,
      cooldown: 4,
      timeCooldown: 0,
    },
  ],
};

//Запуск диалогового окна игры
document.addEventListener('DOMContentLoaded', () => gameStartWindow());
let monster, mag, isPlayer, protectMag;
let timermonster = 5;
const selectDefault = 'Выберите действие';
const playerButton = document.getElementById('player_button');

const levels = [
  { level: 'Легкий уровень', dif: 2 },
  { level: 'Средний уровень', dif: 0 },
  { level: 'Сложный уровень', dif: -2 },
];

//Начало игры
function startGame(level) {
  const playerForm = document.querySelector('.form_player');
  isPlayer = true;
  protectMag = 0;
  monster = JSON.parse(JSON.stringify(monsterObj)); //Создание копии Монстра для игры
  mag = JSON.parse(JSON.stringify(magObj)); //Создание копии Мага для игры
  mag.maxHealth += level; //установка жизни мага в соответствии выбранного уровня
  timermonster += level; //установка таймера монстра в соответствии выбранного уровня
  score();
  magActionOption();
  infoMonster();
  changePlayerButton();
  playerForm.addEventListener('submit', (e) => playerAction(e));
}

//Действие Мага
function playerAction(e) {
  e.preventDefault();
  const checkedMove = Array.from(e.target).filter((e) => e.checked); //Какое оружие выбрано
  if (!checkedMove[0]) return error('Вы не выбрали действие!'); //Проверка на пустое действие
  const move = weaponSelection(mag, checkedMove[0]?.id); //Выбор объекта из выбранного оружия
  //Нападение
  if (isPlayer) {
    isPlayer = false;
    changePlayerButton(); //Изменение кнопки игрока
    return buttle(move); //Нанесение удара
  }
  //Защита
  protectMag = move; //Сохранение защиты
  changePlayerButton();
  protectMag ? (playerButton.disabled = true) : (playerButton.disabled = false); //Очистка защиты
}

//Действие Мостра
async function monsterAction(moveAction) {
  if (!isPlayer) {
    const moves = monster.moves.filter((move) => !move.timeCooldown); //Выбор доступного оружия у монстра
    //Проверка, защита и подсчет урона оружия физическое
    if (moveAction.physicalDmg && !moveAction.magicDmg) {
      moves.sort((a, b) => b.physicArmorPercents - a.physicArmorPercents); // выбор самого эфективного оружия из доступного
      //Подсчет урона
      monster.maxHealth = parseInt(
        monster.maxHealth - moveAction.physicalDmg * (1 - moves[0].physicArmorPercents / 100),
      );
      //Из выбранного оружия устанавливается задержка
      monster.moves.forEach((moveMonster) => {
        if (moveMonster.name === moves[0].name) {
          return (moveMonster.timeCooldown = moves[0].cooldown);
        }
      });
    }
    //Проверка, защита и подсчет урона магическое
    if (!moveAction.physicalDmg && moveAction.magicDmg) {
      moves.sort((a, b) => b.magicArmorPercents - a.magicArmorPercents); // выбор самого эфективного оружия из доступного
      //Подсчет урона
      monster.maxHealth = parseInt(
        monster.maxHealth - moveAction.magicDmg * (1 - moves[0].physicArmorPercents / 100),
      );
      //Из выбранного оружия устанавливается задержка
      monster.moves.forEach((moveMonster) => {
        if (moveMonster.name === moves[0].name) {
          return (moveMonster.timeCooldown = moves[0].cooldown);
        }
      });
    }
    if (monster.maxHealth <= 0) return gameStartWindow('Вы выйграли!'); //Проверка жизни монстра после удара
    infoMonster(`Монстер защитился: ${moves[0].name}`);
    //обновление счета
    score();
    //сообщение об ударе
    const move = await preStrike();
    //удар
    isPlayer = !isPlayer;
    buttle(move);
  }
}

//Сражение и подведение итогов
function buttle(move) {
  if (!isPlayer) {
    //удар по Монстру
    monsterAction(move);
  }
  if (isPlayer) {
    //удар по Магу
    playerDamage(move);
    protectMag && (playerButton.disabled = false); //включение кнопки игрока
    protectMag = 0;
  }
  score(); //обновление счета
  changePlayerButton(); //обновление кнопки игрока
  magActionOption(); //обновление доступного оружия игрока
  if (mag.maxHealth <= 0) return gameStartWindow('Вы проиграли!'); // проверка жизни мага
}

//Подсчет урона мага
function playerDamage(move) {
  mag.maxHealth = parseInt(
    mag.maxHealth - move.physicalDmg * (1 - (protectMag ? protectMag.physicArmorPercents : 0) / 100),
  );
  mag.maxHealth = parseInt(
    mag.maxHealth - move.magicDmg * (1 - (protectMag ? protectMag.magicArmorPercents : 0) / 100),
  );
}

//Подготовка удара монстра
function preStrike(time = 2) {
  return new Promise((res) => {
    setTimeout(async () => {
      // выбор доступного оружия
      const moves = monster.moves.filter((move) => !move.timeCooldown);
      // случайный выбор оружия
      const randome = Math.floor(Math.random() * moves.length);
      const moveRandome = moves[randome].name;
      //сообщение о предполагаемом ударе
      infoMonster(`Монстер готовит удар: ${moveRandome}`);
      await infoTimer();
      res(moves[randome]);
      infoMonster('Монстер ожидает');
    }, time * 1000);
  });
}

//Смена кнопки Мага на удар или защиту
function changePlayerButton() {
  if (!isPlayer) {
    playerButton.innerText = 'Поставить защиту';
    playerButton.classList = 'game_start_btn protect_player';
    return;
  }
  playerButton.innerText = 'Нанести удар';
  playerButton.classList = 'game_start_btn action_player';
}

// Проверяем все оружия у юнита и возвращаем выбранное оружие
function weaponSelection(unit, moveUnit) {
  let weapon = {};
  for (let move of unit.moves) {
    if (move.timeCooldown > 0) move.timeCooldown--; // Если у данного оружия таймер не истек уменьшаем
    // Поиск выбранного оружия

    if (moveUnit === move.name) {
      move.cooldown !== 0 && (move.timeCooldown = move.cooldown); // Если задержка есть, то обнавляем таймер
      weapon = move; // Возвращаем объект с выбранным оружием
    }
  }
  return weapon; //Если что-то пошло не так
}
//Кнопка старт игры
function gameStartWindow(text = 'Выберите уровень') {
  const battle = document.querySelector('.battle');
  const gameStart = document.createElement('div');
  gameStart.className = 'game_start';

  if (text) {
    const textAria = document.createElement('div');
    textAria.className = 'game_start_text';
    textAria.innerText = text;
    gameStart.appendChild(textAria);
  }
  const selectLevel = document.createElement('form');
  selectLevel.className = 'select_level';
  selectLevel.innerHTML = levels.reduce((acc, obj) => {
    acc += `
    <label class="select_lable"  for="${obj.dif}">
      <input
        type="radio"        
        id="${obj.dif}"
        name="level" 
        ${obj.dif === 0 && 'checked'}      
      >
      <span class="radio_button"></span>    
      ${obj.level}
    </label>`;
    return acc;
  }, '');

  const gameStartButton = document.createElement('button');
  gameStartButton.className = 'game_start_btn';
  gameStartButton.innerText = 'Начать баттл';
  gameStartButton.type = 'submit';
  selectLevel.appendChild(gameStartButton);
  gameStart.appendChild(selectLevel);
  battle.appendChild(gameStart);
  const remove = (e) => {
    e.preventDefault();
    const checkedMove = Array.from(e.target).filter((e) => e.checked)[0];
    startGame(+checkedMove.id);
    gameStart.remove(battle);
    selectLevel.addEventListener('submit', remove);
  };
  selectLevel.addEventListener('submit', remove);
}

//Селектор Мага с выбором оружия и его доступности
function magActionOption() {
  const selectMag = document.querySelector('.select_mag');
  selectMag.innerHTML = '';

  const addRadio = mag.moves.reduce((acc, move) => {
    acc += `
    <label class="select_lable" for="${move.name}" style="${
      move.timeCooldown > 0 ? 'color:#868686; cursor:no-drop' : ''
    }">
      <input
        type="radio"
        ${move.timeCooldown > 0 ? 'disabled' : ''}
        id="${move.name}"
        name="mag"       
      >
      <span class="radio_button"></span>    
      ${move.timeCooldown > 0 ? `${move.name} (${move.timeCooldown})` : move.name}
    </label>`;
    return acc;
  }, '');

  selectMag.innerHTML = addRadio;
}

//Общий счет
function score() {
  const healthMag = document.getElementById('health_mag');
  const healthVonster = document.getElementById('health_monster');
  healthMag.innerText = mag.maxHealth;
  healthVonster.innerText = monster.maxHealth;
}

//Окно действий монтстра
function infoMonster(infoText = 'Монстер ожидает') {
  const board = document.getElementById('info_monster');
  board.innerHTML = '';
  const info = document.createElement('div');
  info.className = 'info_monster';
  info.innerText = infoText;
  board.appendChild(info);
}

//Задержка монстра
function infoTimer() {
  return new Promise((res, reg) => {
    let timer = timermonster;
    const infoMonster = document.getElementById('info_monster');
    const timerView = document.createElement('div');
    timerView.className = 'timer_monster';
    infoMonster.appendChild(timerView);
    const setTimer = setInterval(() => {
      timerView.innerHTML = `<p>Нанесет удар через: <span>${timer}</span> секунд!<p>`;
      if (timer === 0) {
        clearInterval(setTimer);
        res();
      }
      timer--;
    }, 1000);
  });
}
