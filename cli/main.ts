import { parseArgs } from "jsr:@std/cli"

type FlagType = 'boolean' | 'string' | 'list'

const flags: {
    [k: string]: {
        type: FlagType,
        alias?: string,
        required?: boolean,
        usage?: string
    }
} = {
    'help': {
        type: 'boolean',
        usage: 'Prints out help information'
    },
    'type': {
        type: 'string',
        alias: 't',
        usage: 'Specifies a template to use to generate boilerplate code'
    }
}
const flagEntries = Object.entries(flags);

/**
 * Parse arguments
 * @param args The arguments from the command line
 */
function parseArguments(args: string[]) {
    return parseArgs(args, {
        string: flagEntries.filter(([k, v]) => v.type === 'string').map(([k, v]) => k),
        boolean: flagEntries.filter(([k, v]) => v.type === 'boolean').map(([k, v]) => k),
        alias: flagEntries.filter(([k,v]) => v.alias).reduce((a, [k, v]) => ({ ...a, [k]: v.alias }), {})
    });
}

/** Print out command line usage */
function printUsage() {
    console.log('%cBoilerplate', 'text-decoration: underline');
    console.log('\nUsage: boilerplate [flags] [directory]')
    console.log('\n%cFlags:', 'font-weight: bold')
    for (const [flag, info] of flagEntries) {
        console.log(`\t${info.alias ? '-'+info.alias+',' : '   '} --${flag}\t\t${info.usage ?? ''}`)
    }
}

// Get command line arguments
const args = parseArguments(Deno.args);
if (args.help) {
    printUsage();
    Deno.exit(0);
}

// run basic template

