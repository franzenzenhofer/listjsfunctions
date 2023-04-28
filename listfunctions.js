#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { parse } from 'acorn';
import clipboardy from 'clipboardy';
import chalk from 'chalk';
import ignore from 'ignore';

const walkJsFiles = (dir, ig) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    if (ig && ig.ignores(file)) return;
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkJsFiles(file, ig));
    } else if (path.extname(file) === '.js' || path.extname(file) === '.mjs') {
      results.push(file);
    }
  });
  return results;
};


const extractFunctions = (filePath) => {
  const code = fs.readFileSync(filePath, 'utf8');
  const ast = parse(code, { ecmaVersion: 'latest', sourceType: 'module' });


  const functions = [];
  const walkNode = (node) => {
    if (node.type === 'FunctionDeclaration') {
      functions.push(`function ${node.id.name}(${node.params.map(p => p.name).join(', ')}) // internal function`);
    } else if (node.type === 'ExportNamedDeclaration' && node.declaration && node.declaration.type === 'FunctionDeclaration') {
      functions.push(`export function ${node.declaration.id.name}(${node.declaration.params.map(p => p.name).join(', ')})`);
    } else if (node.type === 'VariableDeclaration') {
      node.declarations.forEach((declaration) => {
        if (declaration.init && declaration.init.type === 'FunctionExpression') {
          functions.push(`function ${declaration.id.name}(${declaration.init.params.map(p => p.name).join(', ')}) // internal function`);
        } else if (declaration.init && declaration.init.type === 'ArrowFunctionExpression') {
          functions.push(`function ${declaration.id.name}(${declaration.init.params.map(p => p.name).join(', ')}) // internal function`);
        }
      });
    } else if (node.type === 'ExpressionStatement' && node.expression.type === 'AssignmentExpression') {
      const left = node.expression.left;
      const right = node.expression.right;
      if (left.type === 'MemberExpression' && right.type === 'FunctionExpression') {
        const isModuleExports = left.object.name === 'module' && left.property.name === 'exports';
        const isExports = left.object.name === 'exports';
        if (isModuleExports || isExports) {
          if (right.id) {
            functions.push(`exports.${right.id.name}(${right.params.map(p => p.name).join(', ')})`);
          } else {
            functions.push(`exports.anonymous(${right.params.map(p => p.name).join(', ')})`);
          }
        }
      }
    }

    if (node.body) {
      if (Array.isArray(node.body)) {
        node.body.forEach(walkNode);
      } else {
        walkNode(node.body);
      }
    }
  };

  walkNode(ast);

  return functions;
};

const displayHelp = () => {
  console.log(`
Usage: listjsfunctions [options] [directory]

Options:
  -c, --copy        Copy output to clipboard
  -a, --all         Include files listed in .gitignore
  -nc, --nocolor    Disable color coding
  -h, --help        Display this help message and exit

Examples:
  listjsfunctions                List functions in the current directory
  listjsfunctions src            List functions in the src directory
  listjsfunctions -c             List functions and copy output to clipboard
  listjsfunctions -a             List functions including files in .gitignore
`);
  process.exit(0);
};

const getArguments = () => {
  const args = process.argv.slice(2);

  if (args.includes('-h') || args.includes('--help')) {
    displayHelp();
  }

  const options = {
    dir: args.find(arg => !arg.startsWith('-')) || '.',
    copyToClipboard: args.includes('-c') || args.includes('--copy'),
    useGitIgnore: !(args.includes('-a') || args.includes('--all')),
    noColor: args.includes('-nc') || args.includes('--nocolor')
  };

  return options;
};

const generateOutput = (jsFiles, noColor) => {
  let output = '';
  let plainOutput = '';

  jsFiles.forEach((filePath) => {
    const functions = extractFunctions(filePath);
    if (functions.length > 0) {
      output += (noColor ? filePath : chalk.green(filePath)) + '\n';
      plainOutput += filePath + '\n';
      functions.forEach((func) => {
        output += (noColor ? ` ${func}` : chalk.yellow(` ${func}`)) + '\n';
        plainOutput += ` ${func}` + '\n';
      });
      output += '\n';
      plainOutput += '\n';
    }
  });

  return { colored: output, plain: plainOutput };
};

const main = () => {
  const { dir, copyToClipboard, useGitIgnore, noColor } = getArguments();

  let ig;
  if (useGitIgnore) {
    const gitignorePath = path.join(dir, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      ig = ignore().add(gitignoreContent);
    }
  }

  const jsFiles = walkJsFiles(dir, ig);
  const { colored, plain } = generateOutput(jsFiles, noColor);
  console.log(colored);

  if (copyToClipboard) {
    clipboardy.writeSync(plain);
    console.log(noColor ? 'Output copied to clipboard.' : chalk.blue('Output copied to clipboard.'));
  }
};

main();