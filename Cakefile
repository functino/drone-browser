{spawn, exec} = require 'child_process'

compileCoffee = ( src, dst, watch ) ->
    root = spawn 'coffee', ['-c' + (if watch then 'w' else ''), '-o', dst, src]
    root.stdout.on 'data', (data) -> console.log data.toString().trim();
    root.stdout.on 'error', (data) -> console.log data.toString().trim();

task 'build', 'compile *.coffee files to *.js', () ->
    console.log( "Compiling coffee" );
    compileCoffee('.', '.', false);

task 'watch', 'watch and compile *.coffee files', (options) ->
    compileCoffee('.', '.', true)    