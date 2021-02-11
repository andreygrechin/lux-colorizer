# Using `Lux` for fast transition from manual to automated testing

`Lux` scripts by nature are a simple way to move from manual testing to
consistent, repeatable, and automated testing while keeping time to write tests
to a minimum. A little or no experience is required to start. However,
understanding some basic regular expression patterns will benefit you.

Firstly, you need to collect some raw input and output strings to transform them
into a `Lux` script. For example, connect to a host and do a manual test as you
do before.

```sh
ssh rt | tee log.txt
```

Next, you can easily create a `Lux` script by editing `log.txt` (not shown for
brevity) by marking send and receive strings with prefixes and cutting down
insignificant parts of the output. `!` means send a line (command), `?` is
expected output regexp match, and `???` is expected output exact match. Pretty
simple.

![An example](https://github.com/andreygrechin/lux-colorizer/raw/main/assets/images/example-color.png)

An example above does some basic tricks:

1. Decorate stdout and logs outputs (lines 2, 6, 21)
2. Start a new shell `shell1` (line 4)
3. Connect to the host `rt` (line 7), and wait for a regular expression to match
   (regexp '.*' means any character, followed by a hash as a privileged level
   prompt ending, line 8)
4. Turn off pagination and execute "show version" command (lines 9, 11)
5. Check that outputs contain 16.12.04 IOS version, UNIVERSALK9_IAS-M image
   reference, and on followed lines configuration register is 0x2102 (lines
   12-16)
6. Ping cisco.com, expecting 100% success rate (lines 18, 19)

To run a test case:

```sh
lux example1.lux
```

![Example of success](https://github.com/andreygrechin/lux-colorizer/raw/main/assets/images/success.png)

`Lux` shows a progress report during tests run on stdout. In case of any
unexpected results, the test will fail, showing a brief explanation of what was
sent and what was received from the device under test. More detailed log files
will be available for further troubleshooting.

![Example of fail](https://github.com/andreygrechin/lux-colorizer/raw/main/assets/images/fail.png)

For more on `Lux` features, like regular expressions support, switching between
multiple concurrent sessions, extensive logging, post mortem analysis,
debugging, and more, check the
[official documentation](https://github.com/hawk/lux/blob/master/doc/lux.md).

## lux-colorizer, Lux Syntax Highlight VS Code Extension

Each `Lux` script may have hundreds+ of send/expect lines and comments, which
are hard to read and work with. The extension significantly increases
readability and visually distinguishes input and output streams, keywords,
comments, meta statements, special characters and variables. This simplification
will help test writers to produce test in a more structured format and see
syntax errors early before run, increasing the speed of writing, reviewing, and
maintaining test scripts.

## Related Sandbox

Cisco DevNet organization provides a great selection of always-on and
reservation-based sandboxes to test different solutions, products, and APIs,
including
[Cisco NSO](https://devnetsandbox.cisco.com/RM/Diagram/Index/43964e62-a13c-4929-bde7-a2f68ad6b27c?diagramType=Topology).

Unfortunately, existing NSO sandboxes don't have `lux` package installed, to the best
of my knowledge. Moreover, users cannot add `lux` package themselves due to
security policies. To use `lux` user have to build own environment and install
`lux` using standard
[installation guidelines](https://github.com/hawk/lux/blob/master/INSTALL.md).

## Useful References

1. [Lux overview presentation from authors](https://www.youtube.com/watch?v=Nu15YOpmCKQ)
1. [Network Automation Delivery Model Testing](https://developer.cisco.com/docs/network-automation-delivery-model/#!test/test)
1. [Getting Free Trial NSO installer](https://developer.cisco.com/docs/nso/#!getting-and-installing-nso)
