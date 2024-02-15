#!/usr/bin/env node

import { exit, stderr } from "process";
import {exec} from 'child_process'
import chalk from 'chalk'
var inquirer = require('inquirer');
const loading =  require('loading-cli');

async function main() {
  const movesAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'moves',
      message: 'Input moves (move1 move2 ..):',
      validate: function(value: String) {
        // Basic validation to ensure at least two arguments are provided
        const moves = value.trim().split(' ');
        return moves.length >= 2 ? true : 'Please provide at least two arguments.';
      }
    }
  ]);

  const moves = movesAnswer.moves.split(' ');

  const circuitOptions = ['Noir', 'Circom', 'Halo 2'];

  const circuitAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'circuit',
      message: 'Choose zk circuit (only noir is available) :',
      choices: circuitOptions
    }
  ]);
 
  const circuit = circuitAnswer.circuit;

  // check if noir is selected as initially only noir will be supported
  if(circuit !== 'Noir'){
    console.error("Currently only Noir is supported");
    exit(1);
  }


  const load = loading('');
  load.start("Building Noir Circuit in curcuits dir");


  //Install Noir Circuits
  exec(("nargo new circuit"),(error, stdout, stderr)=>{
    if (error) {
      load.fail(error.message);
      return;
  }
  if (stderr) {
      load.fail(stderr);
      return;
  }
  load.succeed("Circuit successfully built");
  
  //if success write/edit noir circuit
  });
}

main().catch(error => {
  console.error('An error occurred:', error);
});
