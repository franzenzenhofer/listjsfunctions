# listjsfunctions command line tool 

List JS Functions is a command-line tool to quickly find and list all JavaScript functions in a specified directory. This tool is handy for developers who want to analyze the code structure and gain an overview of the functions in their projects. It supports various options such as recursive search, ignoring files listed in `.gitignore`, and copying the output to the clipboard.

## Features

- List functions in a specified directory
- Support for ECMAScript modules and CommonJS
- Recursive search in subdirectories (optional)
- Gitignore support (optional)
- Copy output to clipboard (optional)
- Colored output (optional)

## Installation

To install List JS Functions from the GitHub repository, follow these steps:

1. Clone the repository to your local machine:

```bash
git clone https://github.com/franzenzenhofer/listjsfunctions.git
```

2. Navigate to the `listjsfunctions` directory:

```bash
cd listjsfunctions
```

3. Install the dependencies:

```bash
npm install
```

4. To install List JS Functions globally, run:

```bash
npm install -g .
```

## Usage

To list functions in the current directory:

```bash
listjsfunctions
```

To list functions in a specific directory:

```bash
listjsfunctions src
```

To list functions and copy the output to the clipboard:

```bash
listjsfunctions -c
```

To list functions including files listed in `.gitignore`:

```bash
listjsfunctions -a
```

To list functions in the current directory and its subdirectories:

```bash
listjsfunctions -r
```

To list functions in a specific directory and its subdirectories:

```bash
listjsfunctions src -r
```

To list functions including files listed in `.gitignore` and search recursively in subdirectories:

```bash
listjsfunctions -a -r
```

## Example Output

```
src/index.js
 function myFunction(arg1, arg2) // internal function
 export function exportedFunction(arg1, arg2)

src/utils/helper.js
 function helperFunction(arg1) // internal function
```

## Options

```
-c, --copy        Copy output to clipboard
-a, --all         Include files listed in .gitignore
-r, --recursive   Search for JavaScript files recursively in subdirectories
-nc, --nocolor    Disable color coding
-h, --help        Display help message and exit
```

## License

MIT License

## Contributing

Feel free to open issues or submit pull requests to improve the project. Your contributions are welcome!