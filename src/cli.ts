#!/usr/bin/env node

import { exit, stderr } from "process";
import { exec } from "child_process";
import chalk from "chalk";
var inquirer = require("inquirer");
const loading = require("loading-cli");
const fs = require("fs");

const bytes32 = require("bytes32");

const noir_main = (moves: [String]) => {
  return `
  // this is the main function that validates moves and generates verifiable proof 
  fn main(move: Field) {
    // bytes32 array of allowed moves
    let allowed_moves = [${moves.map((move) => bytes32({ input: move }))}];
    let check = allowed_moves.any(|m| m == move);
    assert(check);
}
`;
};

const noir_recursive = () => {
  return `
    use dep::std;

    fn main(
        verification_key : [Field; 114], 
        proof : [Field; 93], 
        public_inputs : [Field; 1], 
        key_hash : Field,
    ) {
        std::verify_proof(
            verification_key.as_slice(), 
            proof.as_slice(), 
            public_inputs.as_slice(), 
            key_hash,
        );
    }
    `;
};

async function main() {
  const movesAnswer = await inquirer.prompt([
    {
      type: "input",
      name: "moves",
      message: "Input moves (move1 move2 ..):",
      validate: function (value: String) {
        // Basic validation to ensure at least two arguments are provided
        const moves = value.trim().split(" ");
        return moves.length >= 2
          ? true
          : "Please provide at least two arguments.";
      },
    },
  ]);

  const moves = movesAnswer.moves.split(" ");

  const circuitOptions = ["Noir", "Circom", "Halo 2"];

  const circuitAnswer = await inquirer.prompt([
    {
      type: "list",
      name: "circuit",
      message: "Choose zk circuit (only noir is available) :",
      choices: circuitOptions,
    },
  ]);

  const circuit = circuitAnswer.circuit;

  // check if noir is selected as initially only noir will be supported
  if (circuit !== "Noir") {
    console.error("Currently only Noir is supported");
    exit(1);
  }

  const load1 = loading("Building Noir Circuit in curcuits dir").start();
  const load2 = loading("Writing into circuit/main").start();
  const load3 = loading("Writing into circuit/recursive").start();

  //Install Noir Circuits
  exec(
    "nargo new circuit/main && nargo new circuit/recursive",
    (error, stdout, stderr) => {
      if (error) {
        load1.fail(chalk.red(error.message));
        return;
      }
      if (stderr) {
        load1.fail(stderr);
        return;
      }
      load1.succeed("Circuit successfully built");

      //if success write/edit noir circuits
      fs.writeFile("circuit/main/src/main.nr", noir_main(moves), (err: any) => {
        if (err) {
          load2.fail(err);
        }
        load2.succeed("Successfully written into circuit/main");
      });
      fs.writeFile("circuit/recursive/src/main.nr", noir_recursive(), (err: any) => {
        if (err) {
          load3.fail(err);
        }
        load3.succeed("Successfully written into circuit/recursive");
      });
    }
  );
}

main().catch((error) => {
  console.error(chalk.red("An error occurred:", error));
});
