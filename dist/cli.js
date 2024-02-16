#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var process_1 = require("process");
var child_process_1 = require("child_process");
var chalk_1 = __importDefault(require("chalk"));
var inquirer = require("inquirer");
var loading = require("loading-cli");
var fs = require("fs");
var bytes32 = require("bytes32");
var noir_main = function (moves) {
    return "\n  // this is the main function that validates moves and generates verifiable proof \n  fn main(move: Field) {\n    // bytes32 array of allowed moves\n    let allowed_moves = [".concat(moves.map(function (move) { return bytes32({ input: move }); }), "];\n    let check = allowed_moves.any(|m| m == move);\n    assert(check);\n}\n");
};
var noir_recursive = function () {
    return "\n    use dep::std;\n\n    fn main(\n        verification_key : [Field; 114], \n        proof : [Field; 93], \n        public_inputs : [Field; 1], \n        key_hash : Field,\n    ) {\n        std::verify_proof(\n            verification_key.as_slice(), \n            proof.as_slice(), \n            public_inputs.as_slice(), \n            key_hash,\n        );\n    }\n    ";
};
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var movesAnswer, moves, circuitOptions, circuitAnswer, circuit, load1, load2, load3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, inquirer.prompt([
                        {
                            type: "input",
                            name: "moves",
                            message: "Input moves (move1 move2 ..):",
                            validate: function (value) {
                                // Basic validation to ensure at least two arguments are provided
                                var moves = value.trim().split(" ");
                                return moves.length >= 2
                                    ? true
                                    : "Please provide at least two arguments.";
                            },
                        },
                    ])];
                case 1:
                    movesAnswer = _a.sent();
                    moves = movesAnswer.moves.split(" ");
                    circuitOptions = ["Noir", "Circom", "Halo 2"];
                    return [4 /*yield*/, inquirer.prompt([
                            {
                                type: "list",
                                name: "circuit",
                                message: "Choose zk circuit (only noir is available) :",
                                choices: circuitOptions,
                            },
                        ])];
                case 2:
                    circuitAnswer = _a.sent();
                    circuit = circuitAnswer.circuit;
                    // check if noir is selected as initially only noir will be supported
                    if (circuit !== "Noir") {
                        console.error("Currently only Noir is supported");
                        (0, process_1.exit)(1);
                    }
                    load1 = loading("Building Noir Circuit in curcuits dir").start();
                    load2 = loading("Writing into circuit/main").start();
                    load3 = loading("Writing into circuit/recursive").start();
                    //Install Noir Circuits
                    (0, child_process_1.exec)("nargo new circuit/main && nargo new circuit/recursive", function (error, stdout, stderr) {
                        if (error) {
                            load1.fail(chalk_1.default.red(error.message));
                            return;
                        }
                        if (stderr) {
                            load1.fail(stderr);
                            return;
                        }
                        load1.succeed("Circuit successfully built");
                        //if success write/edit noir circuits
                        fs.writeFile("circuit/main/src/main.nr", noir_main(moves), function (err) {
                            if (err) {
                                load2.fail(err);
                            }
                            load2.succeed("Successfully written into circuit/main");
                        });
                        fs.writeFile("circuit/recursive/src/main.nr", noir_recursive(), function (err) {
                            if (err) {
                                load2.fail(err);
                            }
                            load2.succeed("Successfully written into circuit/recursive");
                        });
                    });
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error(chalk_1.default.red("An error occurred:", error));
});
