# lux-colorizer, Lux Syntax Highlight VS Code Extension

`Lux` is a universal system-level test tool written in Erlang/OTP by Håkan
Mattsson and other contributors. Based on
[expect](http://www.nist.gov/el/msid/expect.cfm)-like pattern, `Lux` offers
simplified syntax, regular expressions support, switching between multiple
concurrent sessions, extensive logging, post mortem analysis, debugging, and
more. Testing with `Lux` can be a part of more valuable processes, like
developing new services for Cisco NSO, CI/CD pipeline testing, troubleshooting,
etc. It is well known for test automation for developing Cisco Network Service
Orchestrator (NSO) with 4500 test cases per run.

![An example using Monakai color theme](https://github.com/andreygrechin/lux-colorizer/raw/main/assets/images/example-animated.gif)

Some explanations "Why `Lux`" can be found [here](https://github.com/andreygrechin/lux-colorizer/blob/main/USECASE.md).

For more on `Lux` features, please check
[the official documentation](https://github.com/hawk/lux/blob/master/doc/lux.md).

## How to install the extension

You may install the extension via VS Code Quick Open (Ctrl/Cmd+P), paste the
following command, press enter, and click install.

```text
ext install andreygrechin.lux-colorizer
```

Also, you may install it via VS Code
[marketplace](https://marketplace.visualstudio.com/vscode) by searching the name
`andreygrechin.lux-colorizer`.

## How to use the extension

After the installation, the extension will be enabled automatically.

To use snippets, start typing a meta statement, like `[loop]`, and VS Code will
offer possible options. Use TAB to autocomplete a statement and jumping between
input fields.

## Features

### Go to Declaretion

1. Click into variable or include file path
2. Press key F12 (Default shortcut)

For include file path with environment variable (e.g. $W $TEST_DIR)
You need to add custom variable for those variables, by:
1. Ctrl/Command + Shift + P 
2. Type "User settings JSON" -> press Enter
3. Add the below value into the json file opened
```
    "lux.envVariables": {
        "W": "<your_absolute_file_path>",
        "TEST_DIR": "<your_absolute_file_path>"
    },
```
4. Save the file and retry

## How to contribute

1. Clone the repo
2. Run `npm install`
3. Add your magic
4. Test extension (following [this guide](https://code.visualstudio.com/api/working-with-extensions/testing-extension)) 
5. (optional) To build extension file
    1. Run `npm install -g @vscode/vsce`
    2. Run `vsce package` (it will build .vsix file)

## Useful References

1. Lux
    1. [Lux repo](https://github.com/hawk/lux/)
    1. [Lux documentation](https://github.com/hawk/lux/blob/master/doc/lux.md)
    1. [How to install Lux (Note: Lux doesn't support Windows, use WSL)](https://github.com/hawk/lux/blob/master/INSTALL.md)
1. TextMate
    1. [TextMate Language Grammars](https://macromates.com/manual/en/language_grammars)
    1. [Oniguruma regexp syntax](https://macromates.com/manual/en/regular_expressions)
    1. [Oniguruma flavor regexp online editor](https://rubular.com/)
    1. [RegEx101 regexp tester](https://regexp101.com/)
1. More on understanding TextMate
    1. <https://flight-manual.atom.io/hacking-atom/sections/creating-a-legacy-textmate-grammar/>
    1. <https://www.apeth.com/nonblog/stories/textmatebundle.html>
    1. <https://gist.github.com/Aerijo/b8c82d647db783187804e86fa0a604a1>
    1. <https://gist.github.com/DamnedScholar/622926bcd222eb1ddc483d12103fd315>
1. Visual Studio Code Extensions
    1. [Overview](https://code.visualstudio.com/api/language-extensions/overview)
    1. [Syntax Highlight Guide](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide)
    1. [Semantic Highlight Guide](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide)
    1. [Snippets](https://github.com/microsoft/vscode-extension-samples/tree/master/snippet-sample)
