#!/usr/bin/env node

/*
    ___ usage ___ en_US ___
    usage: prolific <protocol> <protocol args>

            --help                      display this message

    ___ $ ___ en_US ___

        udp is required:
            the `--udp` address and port is a required argument

        port is not an integer:
            the `--udp` port must be an integer

    ___ . ___
*/
require('arguable')(module, require('cadence')(function (async, program) {
    program.helpIf(program.ultimate.help)

    program.delegate('edify.' + program.argv.shift(), program.argv, async())
}))
