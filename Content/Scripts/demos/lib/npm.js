let delay = require('./delay')

async function npm(what) {
    let m = require(what)
    if (m) return m

    function locate_node() {
        let path = 'node'
        let p = JavascriptProcess.Create(path, '-e 1')
        if (p) return path

        path = '/usr/local/bin/node'
        p = JavascriptProcess.Create(path, '-e 1')
        if (p) return path

        throw new Error("couldn't locate node")
    }

    let node = locate_node()

    function locate_npm() {
        let p
        let path = '/usr/local/bin/npm'
        p = JavascriptProcess.Create(path,'--version')
        if (p) return path
        
        let cmd = `-e console.log([...process.argv[0].replace(/\\\\/g,'/').split('/').slice(0,-1),'node_modules/npm/cli.js'].join('/'))`
        p = JavascriptProcess.Create(node, cmd, false, true, true, 0, '', true)
        p.Wait()
        return p.ReadFromPipe().split('\n')[0]
    }
    let npm = locate_npm()
    console.log("npm path: ", npm)

    let cwd = Context.GetDir('GameContent')+'Scripts'
    let p = JavascriptProcess.Create(node,`"${npm}" i ${what}`,false, true, true,0, cwd, true)
    function pipe() {
        let s = p.ReadFromPipe()
        console.log(s)
    }
    while (p.IsRunning()) {
        await delay(50)
        pipe()
    }
    pipe()
    return require(what)
}

module.exports = npm
