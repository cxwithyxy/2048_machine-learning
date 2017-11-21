
var ProjectName = 'Neuroevolution_2048';

var Neuvol = new Neuroevolution({
    population:50,
    network:[16, [14], 4]
});

var generationCount = 0;

var G = null;

if(localStorage.getItem(ProjectName)){
    var savingData = JSON.parse(localStorage.getItem(ProjectName));
    G = Neuvol.nextGeneration(savingData);
    console.log('loaded');
}else{
    G = Neuvol.nextGeneration();
}
generationCount ++;

/**
 * 初始化死亡列表
 */
var G_deaded = [];

/**
 * iframe
 */
var iframeList = [];

var lastInputString = [];

/**
 * 操控每一个iframe
 */
function eachIframe(_do)
{
    
    for(var i = 0; i < iframeList.length; i++){
        _do(iframeList[i].contentWindow, i);
    }
}

function isAllDead()
{
    var allDead = true;
    eachIframe(function (_win, _index)
    {
        allDead = !!G_deaded[_index];
    });
    return allDead;
}

var frameLoopHL = 0;
function startAIFrame()
{
    frameLoopHL = setInterval(function ()
    {
        eachIframe(function (_win, _index)
        {
            if(!G_deaded[_index]){
                var theCells = _win.G2048.grid.cells;
                
                var theInput = [];
                for(var i = 0; i < 4; i++){
                    for(var j = 0; j < 4; j++){
                        var pushInArray = 0;
                        if(theCells[i][j]){
                            pushInArray = theCells[i][j].value;
                        }
                        theInput.push(pushInArray);
                    }
                }

                // var res = G[_index].compute(theInput)[0];

                // res *= 4;
                // if(res >=0 && res <1 ){
                //     _win.G2048.move(0);
                // }
                // if(res >=1 && res <2 ){
                //     _win.G2048.move(1);
                // }
                // if(res >=2 && res <3 ){
                //     _win.G2048.move(2);
                // }
                // if(res >=3 && res <4 ){
                //     _win.G2048.move(3);
                // }

                var res = G[_index].compute(theInput);
                var resObjList = [];
                for(var i = 0; i < res.length; i++){
                    resObjList.push({index: i, value: res[i]});
                }
                resObjList.sort(function (a, b)
                {
                    if(a.value > b.value){
                        return false;
                    }
                    return true;
                })
                _win.G2048.move(resObjList[0].index);
                

                if(lastInputString[_index] == JSON.stringify(theInput)){
                    // G_deaded[_index] = 1;
                    G_deaded[_index] = 2;
                }

                if(_win.G2048.serialize().over){
                    G_deaded[_index] = 2;
                }

                lastInputString[_index] = JSON.stringify(theInput);

            }
        });
        if(isAllDead()){
            clearInterval(frameLoopHL);
            /**
             * 
             */
            setTimeout(function ()
            {
                eachIframe(function (_win, _index){
                    // var theCells = _win.G2048.grid.cells;
                    // var theInput = [];
                    // for(var i = 0; i < 4; i++){
                    //     for(var j = 0; j < 4; j++){
                    //         var pushInArray = 0;
                    //         if(theCells[i][j]){
                    //             pushInArray = theCells[i][j].value;
                    //         }
                    //         theInput.push(pushInArray);
                    //     }
                    // }
                    // theInput.sort();
                    // Neuvol.networkScore(G[_index], theInput.pop());
                    Neuvol.networkScore(G[_index], _win.G2048.serialize().score);
                    if(G_deaded[_index] == 2){
                        _win.G2048.restart();
                    }
                });
                G = Neuvol.nextGeneration();

                // var savingData = [];
                // for(var i = 0; i < G.length; i++){
                //     savingData.push(G[i].getSave());
                // }
                // localStorage.setItem(ProjectName, JSON.stringify(savingData));
                
                G_deaded = [];
                lastInputString = [];
                generationCount ++;
                console.log("第" + generationCount + "代");
                startAIFrame();
            },300);
        }
    },100)
}

setTimeout(function (){
    var body = document.getElementsByTagName('body')[0];
    for(var i = 0; i < G.length; i++){
        var ifff = document.createElement('iframe');
        ifff.src="game.html";
        ifff.setAttribute("frameborder","0");
        iframeList.push(ifff);
        body.appendChild(ifff);
    }
    setTimeout(function ()
    {
        startAIFrame();
    }, 10000)
});