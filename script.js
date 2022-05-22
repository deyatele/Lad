const answer = document.getElementById('answer');
const noPlace = document.getElementById('matchNoPlace');
const onPlace = document.getElementById('matchOnPlace');

const questionRandom = Math.floor(Math.random() * (1000000 - 99) + 99);

let count = 0;

answer.addEventListener('click', getAnswer);

function getAnswer() {
  if (count > 10) {
    setTimeout(() => location.reload(), 5000);
    answer.disabled = true;
    return error(
      `Вы превысили колличество попыток. Игра будет перезапущена. Загаданное число было ${questionRandom}`,
      5,
    );
  }
  const input = document.getElementById('input');
  let answerValue = input.value.trim();
  const question = questionRandom.toString().split('');
  if (isNaN(answerValue)) {
    error('Введите число который загадал компьютер, вы ввели не корректное число');
    input.value = '';
    return;
  }
  if (questionRandom === +answerValue) {
    error('Поздравляю вы выйграли!!!');
  }
  answerValue = answerValue.split('');
  if (answerValue.length > 6 || answerValue.length < 3) {
    error('Диапазон  различающихся цифр составляет от 3 до 6');
    input.value = '';
    return;
  }
  count++;
  const countOnPlace = [];
  const countNoPlace = [];
  for (let indx = 0; indx < question.length; indx++) {
    if (question[indx] == answerValue[indx]) {
      countOnPlace.push(answerValue[indx]);
      question.splice(indx, 1);
      answerValue.splice(indx, 1);
      indx--;
      continue;
    }

    if (question.includes(answerValue[indx])) {
      countNoPlace.push(answerValue[indx]);
    }
  }

  noPlace.textContent = `${countNoPlace.length}(${countNoPlace.join(',')})`;
  onPlace.textContent = `${countOnPlace.length}(${countOnPlace.join(',')})`; // Можно применить new Set чтобы они отсортировались и не было понятно какое число (уровень hard)
}

function error(message, t = 5) {
  const wrapper = document.querySelector('.wrapper');
  const classError = document.querySelector('.error');
  if (classError) return;
  const errorMessge = document.createElement('div');
  errorMessge.classList = 'error';
  errorMessge.innerHTML = `<p>${message}</p>`;
  wrapper.appendChild(errorMessge);
  setTimeout(() => {
    errorMessge.remove();
  }, t * 1000);
}
