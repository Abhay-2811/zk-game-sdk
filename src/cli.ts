#!/usr/bin/env node

var inquirer = require('inquirer');

async function main() {
  const movesAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'moves',
      message: 'Input moves (move1 move2):',
      validate: function(value: any) {
        // Basic validation to ensure at least two arguments are provided
        const moves = value.trim().split(' ');
        return moves.length >= 2 ? true : 'Please provide at least two arguments.';
      }
    }
  ]);

  const moves = movesAnswer.moves.split(' ');

  const circuitOptions = ['Choice 1', 'Choice 2', 'Choice 3'];

  const circuitAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'circuit',
      message: 'Choose circuit:',
      choices: circuitOptions,
    }
  ]);

  const circuit = circuitAnswer.circuit;

  console.log('Moves:', moves);
  console.log('Selected circuit:', circuit);
}

main().catch(error => {
  console.error('An error occurred:', error);
});
