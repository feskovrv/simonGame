let vm = new Vue({
    el:"#app",
    data:{
        order: [4, 2, 3],
        answer: [],
        speed: 1300,
        speedDisabled: false,
        random: false, 
        randomDisabled: false,
        record: JSON.parse(localStorage.getItem('record')),
        round: 0,
        status: "Для начала игры нажмите START",
        eventname: null,
        mute: false,
        buttons: {
            button1: false,
            button2: false,
            button3: false,
            button4: false
        }
    },
    methods:{
        gameStart(){
            this.randomDisabled = this.speedDisabled = true;
            this.order.splice(0);
            this.status = `Игра началась`
            this.addNewNumber();
            this.playRound(this.speed);
        },
        addNewNumber(){
            function getRandomIntInclusive(min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min + 1)) + min;
              };
            this.order.push(getRandomIntInclusive(1, 4));
        },
        async playRound(spd){
            let i = 0;
            async function myLoop(context){
                await new Promise((res)=>{
                    setTimeout(()=>{
                        context.buttons[`button${context.order[i]}`] = true;
                        if(!context.mute){
                            context.playSound(context.order[i]);
                        }
        
                        setTimeout(()=>{
                            context.buttons[`button${context.order[i]}`] = false;
                            
                            if(i < (context.order.length - 1)){
                                i = i + 1;
                                myLoop(context)
                            }else{
                                res()
                            }
                        }, 200);
        
                    }, spd)
                }).then(()=>{
                    context.eventname = "click"
                })
            };
            await myLoop(this);
        },
        listenButton(e){
            console.log(e.target);
            if(e.target.classList.contains("button1")){
                this.checkAnswer(1)
            }else if(e.target.classList.contains("button2")){
                this.checkAnswer(2)
            }else if(e.target.classList.contains("button3")){
                this.checkAnswer(3)
            }else if(e.target.classList.contains("button4")){
                this.checkAnswer(4)
            }
        },
        checkAnswer(val){
            this.answer.push(val);
            const arr = this.order.slice(0, this.answer.length);
            let res = true;
            arr.forEach((el, idx) => {
                res = el == this.answer[idx] ? true : false
                if(!res){ this.stopGame() }
            })
            if (this.order.length == this.answer.length && res){this.nextRound()}
        },
        stopGame(){
            this.eventname = null;
            this.order.splice(0);
            this.answer.splice(0);
            this.status = `Ваш счет: ${this.round}. Нажмите START для начала новой игры`
            if(this.round > this.record) {
                this.record = this.round;
                localStorage.setItem('record', this.record)
            }
            this.round = 0;
            this.speedDisabled = false;
            this.randomDisabled = false;
        },
        nextRound(){
            if(this.random){
                this.order.splice(0);
                for(let i = 0; i <= this.round; i++){
                    this.addNewNumber();
                }
            }
            this.answer = [];
            this.round = this.round + 1;
            this.eventname = null;
            this.status = `Пройдено уровней: ${this.round}`;
            this.addNewNumber();
            this.playRound(this.speed);
        },
        playSound(num){
            let audio = new Audio(`./sounds/${num}.mp3`);
            audio.play();
        }
    }
})