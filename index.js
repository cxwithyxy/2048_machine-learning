
var ProjectName = 'Neuroevolution_2048';

var Neuvol = new Neuroevolution({
    population:50,
    network:[16, [12], 1],
    nbChild:25
});

var G = null;

if(localStorage.getItem(ProjectName)){
    var savingData = JSON.parse(localStorage.getItem(ProjectName));
    G = Neuvol.nextGeneration(savingData);
    console.log('loaded');
}else{
    G = Neuvol.nextGeneration();
}

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
        setInterval(function ()
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

                    var res = G[_index].compute(theInput);

                    res *= 4;
                    if(res >=0 && res <1 ){
                        _win.G2048.move(0);
                    }
                    if(res >=1 && res <2 ){
                        _win.G2048.move(1);
                    }
                    if(res >=2 && res <3 ){
                        _win.G2048.move(2);
                    }
                    if(res >=3 && res <4 ){
                        _win.G2048.move(3);
                    }

                    if(lastInputString[_index] == JSON.stringify(theInput)){
                        G_deaded[_index] = 1;
                    }

                    if(_win.G2048.serialize().over){
                        G_deaded[_index] = 2;
                    }

                    lastInputString[_index] = JSON.stringify(theInput);

                }
            });
            if(isAllDead()){

                /**
                 * 
                 */
                setTimeout(function ()
                {
                    eachIframe(function (_win, _index){
                        Neuvol.networkScore(G[_index], _win.G2048.serialize().score);
                        if(G_deaded[_index] == 2){
                            _win.G2048.restart();
                        }
                    });
                    G = Neuvol.nextGeneration();
                    G_deaded = [];
                    lastInputString = [];
                },1000);
            }
        },300)
    }, 10000)
});