const fs = require('fs');
const term = require('terminal-kit').terminal;
const argv = require('yargs').argv;
const path = require('path');

const walk1 = fs.readFileSync(path.join(__dirname, '/ascii/pv-1-80.txt'), 'utf8');
const walk2 = fs.readFileSync(path.join(__dirname, '/ascii/pv-2-80.txt'), 'utf8');
const jump1 = fs.readFileSync(path.join(__dirname, '/ascii/pv-3-80.txt'), 'utf8');
const jump2 = fs.readFileSync(path.join(__dirname, '/ascii/pv-4-80.txt'), 'utf8');

const statesWalking = [walk1, walk2];
const statesJumping = [jump1, jump2];

const millisLimit = parseSArg() || -1;

let stateWalking = 0,
  stateJumping = 0;

// setup terminal
term.clear();
term.moveTo(1, 1);
term.hideCursor();
term.bgBlack();
term.brightGreen();

function parseSArg() {
  if(!argv.s) {
    return null;
  }
  if(!Number.isInteger(argv.s)) {
    return null;
  }
  return parseInt(argv.s, 10) * 1000;
}

function nextWalkState() {
  stateWalking++;
  if(stateWalking > statesWalking.length - 1) {
    stateWalking = 0;
  }
  return stateWalking;
};

function nextJumpState() {
  stateJumping++;
  if(stateJumping > statesJumping.length - 1) {
    stateJumping = 0;
  }
  return stateJumping;
};

function mainLoop() {
  // every 3rd loop, do the jump
  let sinceLastJump = 0;
  const start = Date.now();

  const loop = setInterval(() => {
    term.clear();
    term.moveTo(1, 1);

    let next = null,
      iter = 1;

    if([3, 4].includes(sinceLastJump)) {
      next = statesJumping[nextJumpState()];
    } else {
      next = statesWalking[nextWalkState()];
    }

    let lines = next.split('\n');

    lines.forEach((line) => {
      term.moveTo(1, iter, line);
      iter++;
    });

    sinceLastJump++;
    if(sinceLastJump >= 5) {
      sinceLastJump = 0;
    }

    if(millisLimit !== -1 && Date.now() - start > millisLimit) {
      clearInterval(loop);
    }
  }, 300);
}

function walkOnLeft(cb) {
  let x = term.width;
  let amountToSubstring = 0;

  const loop = setInterval(() => {
    term.clear();
    term.moveTo(1, 1);

    let next = statesWalking[nextWalkState()];
    let iter = 1;
    let lines = next.split('\n');

    lines.forEach((line) => {
      let sub = line.substr(0, amountToSubstring);
      term.moveTo(x, iter, sub);
      iter++;
    });

    // move to the left.
    x -= 7;
    amountToSubstring += 7;
    if(amountToSubstring >= 80) {
      amountToSubstring = 80;
    }
    if(x <= 7) {
      clearInterval(loop);
      return cb();
    }
  }, 150);
}

walkOnLeft(() => {
  mainLoop();
});
