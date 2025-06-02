const canvas = document.getElementById("canvas"); //se obtiene el elemento canvas del html que tiene el idcanvas, este es el espacio donde se dibuja el juego
const canvasContext = canvas.getContext("2d"); //se obtiene contexto 2D del canvas, para dibujar en el lineas, img, figuras, etc.
const pacmanFrames = document.getElementById("animation"); //llama los frames del pacman
const ghostFrames = document.getElementById("ghosts"); //llama a los frames de los ghosts

let createRect = (x, y, //coordenadas donde empieza el rectangulo
     width, height, //tamaño del rectangulo
      color) => { //color con el que se va a dibujar
    canvasContext.fillStyle = color; //linea que define de que color se dibuja
    canvasContext.fillRect(x, y, width, height); //dibuja el rectangulo
};

const sounds = { //organiza y almacena los efectos de sonido del juego
    eat: new Audio("sounds/audiopacman.mp3"),
    powerup: new Audio("sounds/pacman-eating-cherry.mp3"), 
    die: new Audio("sounds/pacman-dies.mp3"),
    eatGhost: new Audio("sounds/pacman-eating-ghost.mp3"),
    inicio: new Audio("sounds/pacman-song.mp3")
};

//estas constantes representan las direcciones en las que pac/ghost pueden moverse
//usando numeros para identificarlos
const Direction_Right = 4;
const Direction_up = 3;
const Direction_left = 2;
const Direction_down = 1;
let lives = 3; //vidas del pacman
let ghostCount = 4; //cantidad de fantasmas
let ghostImageLocations = [ //posiciones de los sprites(img que puedes mover)
    { x: 0, y: 0 },//indica la posicion dentro de la img de los sprites de los fantasmas
    { x: 176, y: 0 },
    { x: 0, y: 121 },
    { x: 176, y: 121 },
];


let showFood = true; //Determina si se debe dinujar la comida en el canvas

let ghostVulnerableTime = 0;      // tiempo restante en segundos durante el cual los fantasmas estan vulnerables
let ghostVulnerableTimer = null;  // para guardar el setInterval, que va descontando ese tiempo


let fps = 30; //define los cuadros por s a los que se va a actualizar el juego , por ejemplo 30 veces por segundo
let pacman; //variable que almacenará el objeto Pacman, pos, dir, vel.
let oneBlockSize = 20; // define el tamaño de cada bloque del laberinto
let score = 0; //puntaje del jugador

//Variable booleana
let isGameOver = false; //estado del juego
let ghosts = []; //arreglo que almacenara todos los objetos de los fantasmas creados

let wallSpaceWidth = oneBlockSize / 1.6; //grosor de las paredes
let wallOffset = (oneBlockSize - wallSpaceWidth) / 2; //cuanto espacio queda entre el borde del bloque y la pared
let wallInnerColor = "black"; //color interior de las paredes


//1 pared
//0 vacio
// 2 comida
//4 powerup
// 21 columnas 
// 23 filas


let levels = [ //nivel 1
    [
    [1, 1, 1, 1, 1,  1, 1, 1, 1, 1,  1, 1, 1, 1, 1,  1, 1, 1, 1, 1,  1],
    [1, 2, 2, 2, 2,  2, 2, 2, 1, 2,  2, 2, 1, 2, 2,  2, 2, 2, 2, 4,  1],
    [1, 2, 1, 1, 1,  1, 2, 2, 1, 2,  1, 2, 1, 2, 2,  1, 1, 1, 1, 2,  1],
    [1, 2, 1, 2, 2,  2, 2, 2, 2, 2,  1, 2, 2, 2, 2,  2, 2, 2, 1, 2,  1],
    [1, 2, 2, 2, 2,  2, 1, 1, 2, 2,  1, 2, 2, 1, 1,  2, 2, 2, 2, 2,  1],
    [1, 2, 1, 1, 1,  2, 1, 1, 2, 2,  1, 2, 2, 1, 1,  2, 1, 1, 1, 2,  1],
    [1, 4, 2, 2, 2,  2, 2, 2, 2, 2,  2, 2, 2, 2, 2,  2, 2, 2, 2, 2,  1],
    [1, 1, 1, 1, 1,  2, 2, 2, 1, 1,  1, 1, 1, 2, 2,  2, 1, 1, 1, 1,  1],
    [0, 0, 0, 0, 1,  2, 1, 2, 2, 2,  2, 2, 2, 2, 1,  2, 1, 0, 0, 0,  0],
    [1, 1, 1, 1, 1,  2, 1, 2, 1, 1,  0, 1, 1, 2, 1,  2, 1, 1, 1, 1,  1],
    [2, 2, 2, 2, 2,  2, 2, 2, 1, 0,  0, 0, 1, 2, 2,  2, 2, 2, 2, 2,  2],
    [1, 1, 2, 1, 1,  2, 1, 2, 1, 0,  0, 0, 1, 2, 1,  2, 1, 1, 2, 1,  1],
    [0, 1, 2, 2, 1,  2, 1, 2, 1, 1,  1, 1, 1, 2, 1,  2, 1, 2, 2, 1,  0],
    [0, 1, 2, 2, 1,  2, 1, 2, 2, 2,  2, 2, 2, 2, 1,  2, 1, 2, 2, 1,  0],
    [1, 1, 2, 2, 1,  2, 1, 2, 1, 1,  1, 1, 1, 2, 1,  2, 1, 2, 2, 1,  1],
    [1, 4, 2, 2, 2,  2, 2, 2, 2, 2,  2, 2, 2, 2, 2,  2, 2, 2, 2, 4,  1],
    [1, 2, 1, 1, 1,  2, 1, 1, 1, 2,  1, 2, 1, 1, 1,  2, 1, 1, 1, 2,  1],
    [1, 2, 2, 2, 1,  2, 2, 2, 2, 2,  1, 2, 2, 2, 2,  2, 1, 2, 2, 2,  1],
    [1, 1, 2, 2, 1,  2, 1, 2, 1, 1,  1, 1, 1, 2, 1,  2, 1, 2, 2, 1,  1],
    [1, 2, 2, 2, 2,  2, 1, 2, 2, 2,  1, 2, 2, 2, 1,  2, 2, 2, 2, 2,  1],
    [1, 2, 1, 1, 1,  1, 1, 1, 1, 2,  1, 2, 1, 1, 1,  1, 1, 1, 1, 2,  1],
    [1, 4, 2, 2, 2,  2, 2, 2, 2, 2,  2, 2, 2, 2, 2,  2, 2, 2, 2, 4,  1],
    [1, 1, 1, 1, 1,  1, 1, 1, 1, 1,  1, 1, 1, 1, 1,  1, 1, 1, 1, 1,  1]
],
 //nivel 2
 [
    [1, 1, 1, 1, 1,  1, 1, 1, 1, 1,  1, 1, 1, 1, 1,  1, 1, 1, 1, 1,  1],
    [1, 2, 2, 2, 2,  2, 2, 2, 2, 2,  1, 2, 2, 2, 2,  2, 2, 2, 2, 4,  1],
    [1, 2, 1, 1, 1,  2, 1, 1, 1, 2,  1, 2, 1, 1, 1,  2, 1, 1, 1, 2,  1],
    [1, 2, 1, 1, 1,  2, 1, 1, 1, 2,  1, 2, 1, 1, 1,  2, 1, 1, 1, 2,  1],
    [1, 2, 2, 2, 2,  2, 2, 2, 2, 2,  2, 2, 2, 2, 2,  2, 2, 2, 2, 2,  1],
    [1, 2, 1, 1, 1,  2, 1, 2, 1, 1,  1, 1, 1, 2, 1,  2, 1, 1, 1, 2,  1],
    [1, 4, 2, 2, 2,  2, 1, 2, 2, 2,  1, 2, 2, 2, 1,  2, 2, 2, 2, 2,  1],
    [1, 1, 1, 1, 1,  2, 1, 1, 1, 2,  1, 2, 1, 1, 1,  2, 1, 1, 1, 1,  1],
    [0, 0, 0, 0, 1,  2, 1, 2, 2, 2,  2, 2, 2, 2, 1,  2, 1, 0, 0, 0,  0],
    [1, 1, 1, 1, 1,  2, 1, 2, 1, 1,  0, 1, 1, 2, 1,  2, 1, 1, 1, 1,  1],
    [2, 2, 2, 2, 2,  2, 2, 2, 1, 0,  0, 0, 1, 2, 2,  2, 2, 2, 2, 2,  2],
    [1, 1, 1, 1, 1,  2, 1, 2, 1, 0,  0, 0, 1, 2, 1,  2, 1, 1, 1, 1,  1],
    [0, 0, 0, 0, 1,  2, 1, 2, 1, 1,  1, 1, 1, 2, 1,  2, 1, 0, 0, 0,  0],
    [0, 0, 0, 0, 1,  2, 1, 2, 2, 2,  2, 2, 2, 2, 1,  2, 1, 0, 0, 0,  0],
    [1, 1, 1, 1, 1,  2, 1, 2, 1, 1,  1, 1, 1, 2, 1,  2, 1, 1, 1, 1,  1],
    [1, 4, 2, 2, 2,  2, 2, 2, 2, 2,  1, 2, 2, 2, 2,  2, 2, 2, 2, 4,  1],
    [1, 2, 1, 1, 1,  2, 1, 1, 1, 2,  1, 2, 1, 1, 1,  2, 1, 1, 1, 2,  1],
    [1, 2, 2, 2, 1,  2, 2, 2, 2, 2,  1, 2, 2, 2, 2,  2, 1, 2, 2, 2,  1],
    [1, 1, 2, 2, 1,  2, 1, 2, 1, 1,  1, 1, 1, 2, 1,  2, 1, 2, 2, 1,  1],
    [1, 2, 2, 2, 2,  2, 1, 2, 2, 2,  1, 2, 2, 2, 1,  2, 2, 2, 2, 2,  1],
    [1, 2, 1, 1, 1,  1, 1, 1, 1, 2,  1, 2, 1, 1, 1,  1, 1, 1, 1, 2,  1],
    [1, 4, 2, 2, 2,  2, 2, 2, 2, 2,  2, 2, 2, 2, 2,  2, 2, 2, 2, 4,  1],
    [1, 1, 1, 1, 1,  1, 1, 1, 1, 1,  1, 1, 1, 1, 1,  1, 1, 1, 1, 1,  1],
 ]
 
];

let currentLevel = 0; //variable que indica que nicel esta activo
 map = levels[currentLevel]; //variable que contiene el diseño del laberinto tomado de un array

 function loadLevel(levelIndex) { //para cargar un nivel especifico
    map = levels[levelIndex]; //carga el mapa de nivel indicado
    createNewPacman(); //crea a pacman en su posicion inicial
    createGhosts(); //crea los fantasmas para ese nivel
    showFood = true; //vuelve a mostrar la comida
    ghostVulnerableTime = 0; //reinicia el timpo de vulnerabilidad
    if (ghostVulnerableTimer) clearInterval(ghostVulnerableTimer); //detiene el temp si estaba activo
}


let randomTargetsForGhosts = [ //array de 4 puntos especificos del mapa , calcula coordenadas de pixeles
    { x: 1 * oneBlockSize, y: 1 * oneBlockSize },
    { x: 1 * oneBlockSize, y: (map.length - 2) * oneBlockSize },
    { x: (map[0].length - 2) * oneBlockSize, y: oneBlockSize },
    {
        x: (map[0].length - 2) * oneBlockSize,
        y: (map.length - 2) * oneBlockSize,  //destinos aleatorios para que los fantasmas se dirijan hacia ellos 
    },
];


let createNewPacman = () => { //crea un objeto pacman usando newPacman
    pacman = new Pacman( //crea al personaje con posicion,tamaño y velocidad
        oneBlockSize,
        oneBlockSize,
        oneBlockSize,
        oneBlockSize, //define que todo este alineado al tamaño del mapa
        oneBlockSize / 5
    );
};

let gameLoop = () => { //define una funcion
     if (isGameOver) return; //verifica si el juego ha terminado
    update(); //lama a la funcion update que actualiza el estado del juego, personajes, logica , deteccion etc
    draw(); //llama a la fun draw , dibuja el estado actual del juego en la pantalla
};

setInterval(() => { //funcion que ejecuta repetidamente otro bloque de codigo cada 200milisegundos
    showFood = !showFood; //hace que se muestre cada 200ms como un efecto de parpadeo
}, 200); // alterna cada 200 ms )

let restartPacmanAndGhosts = () => { //define una funcion
    createNewPacman(); //se llama para crear o reiniciar la pos de pacman
    createGhosts(); // se llama para crear o reiniciar los ghosts
};


let onGhostCollision = () => {
    lives--; //resta una vida al jugador cada vez que colisiona con un fantasma

    sounds.die.play();
    if (lives === 0) { //cerifica si al jugador ya no le quedan vidas
        isGameOver = true;     //marca que el juego ha terminado
        drawGameOver();       // Llama a una funcion que probablemente dibuja en la pantalla un mensaje de [GAME OVER]
        return; //Evita que se reinicie el juego si ya se acabo
    }

    restartPacmanAndGhosts(); // Solo se ejecuta si aun tiene vidas
};


let update = () => {
    pacman.moveProcess(); //mueve a pacman segun la entrada del jugador
    pacman.eat(); //Come puntos si hay alguno en su pos actual
    updateGhosts(); //mueve a los fantasmas segun su logica 
    if (pacman.checkGhostCollision(ghosts)) { //verifica si pacman ha colisionado con alguno de los fantasmas
        onGhostCollision(); //si ha colision llama a esta funcion para manejar la perdida de vida o game over
    }
    if (isLevelCleared()) { //comprueba si el jugador ha recogido toos los puntos del nivel actual sisi avanza al sig level
    currentLevel++; //aumenta el numero del nivel actual en uno
    if (currentLevel >= levels.length) { //verifica si ya se completaron todos los levels disponibles
        isGameOver = true; //si se completo los niveles, termina con una victoria
        drawVictory(); //se muestra un mensaje de victoria
    } else {
        loadLevel(currentLevel); //si aun uquedan niveles se carga el sig
    }
}

};

let isLevelCleared = () => { //su proposito es verificar si el nivel actual ya fue completado
    for (let row of map) { //recorre cada fila del map , map es el array que representa el nivel del juego
        for (let cell of row) { //recorre cada celda dentro de esa fila
            if (cell === 2 || cell === 4) return false;
        }
    }
    return true; //si revisa todo el mapa y no encuentra celdas con 2 o 4 , quiere decir que pacman ya se comio todo
};


let drawFoods = () => {

    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            //comida normla
            if (map[i][j] == 2) {
                canvasContext.beginPath(); //inicia un nuevo camino para dibujar
                canvasContext.fillStyle = "#FEB897"; //define el color del relleno
                canvasContext.arc(
                    j * oneBlockSize + oneBlockSize / 2, // centro X
                    i * oneBlockSize + oneBlockSize / 2, // centro Y
                    oneBlockSize / 6,    // radio pequeño circulo para representar la comida
                    0,
                    2 * Math.PI
                );
                canvasContext.fill(); //rellena el circulo con el color el color definido
            }
            if(map[i][j] == 4 && showFood){ //indica que la celda contiene powerup
                //power
                canvasContext.beginPath(); //inicia el dibujo de un nuevo objeto
                canvasContext.fillStyle = "#FFFFF"; //color del relleno
                canvasContext.arc( //dibuja un circulo
                    j * oneBlockSize + oneBlockSize / 2,
                    i * oneBlockSize + oneBlockSize / 2,
                    oneBlockSize / 3, //mas grande que la comida normal
                    0,
                    2* Math.PI
                );
                canvasContext.fill(); //rellena la forma del color definido
            }
        }
    }
};

let drawRemainingLives = () => { //dibuja en pantalla la cantidad de vidas que le quedan al pacman
    canvasContext.font = "20px 'Pixelify Sans'"; //fuente para dibujar el texto en el canvas
    canvasContext.fillStyle = "white"; //color del texto
    canvasContext.fillText("Lives: ", 220, oneBlockSize * (map.length + 1));

    for (let i = 0; i < lives; i++) {
        canvasContext.drawImage(
            pacmanFrames,
            2 * oneBlockSize, //X de la subImg en pacmanFrames
            0,                //Y de la subImg en pacmanFrames
            oneBlockSize,     //ancho de recorte
            oneBlockSize,     //alto de recorte
            350 + i * oneBlockSize, // X en el canvas para dibujar la vida
            oneBlockSize * map.length + 2, // Y en el canvas para dibujar la vida
            oneBlockSize, // ancho para dibujar en el canvas
            oneBlockSize // alto para dibujar en el canvas
        );
    }
};

let drawScore = () => {
    canvasContext.font = "20px 'Pixelify Sans'"; //fuente
    canvasContext.fillStyle = "white"; //color de texto
    canvasContext.fillText( //dibuja el texto en el canvas
        "Score: " + score,
        0,
        oneBlockSize * (map.length + 1) //la coordenada Y es justo debajo del mapa, es decir un bloque mas abajo del final del mapa
    );
};

let drawVulnerableTimer = () => {
    if (ghostVulnerableTime > 0) { //solo dibuja el texto si la var, es mayor que 0 , es decir mientras los ghosts estan vulnerables
        canvasContext.font = "20px 'Pixelify Sans'"; //fuente
        canvasContext.fillStyle = "#00ffff"; //color
        canvasContext.fillText( //dibuja 
            `ghosts: ${ghostVulnerableTime}s`, //inserta el valor de la var ghostvule.. dentro del texto, por ejemplo si es 5, el texto sera ghost:5
            110, //coordenadoa X horizontal
            oneBlockSize * (map.length + 1) //justo debajo del mapa
        );
    }
};


let draw = () => {
      if (isGameOver) return; // evita dibujar encima del Game Over

    canvasContext.clearRect(0, 0, canvas.width, canvas.height); //limpia todo el canvas
    createRect(0, 0, canvas.width, canvas.height, "black"); //pinta el fondo negro

//llamando funciones
    drawWalls(); //dibuja paredes
    drawFoods(); //fibuja la comida
    drawGhosts(); //dibuja los fantasmas
    pacman.draw(); //dibuja a pacman
    drawScore(); //muestra la puntuacion
    drawRemainingLives(); //muestra las vidas restantes
    drawVulnerableTimer(); //muestra el contador de vulnerabilidad de ghosts
};

let drawWalls = () => {
    //recorre todad las filas del mapa
    for (let i = 0; i < map.length; i++) {
        //recorre todas las columnas del mapa en la fila actual
        for (let j = 0; j < map[0].length; j++) {
             // Si el valor en esta celda es 1, significa que es una pared
            if (map[i][j] == 1) {
                 // Dibuja un rectángulo en la posición correspondiente
                createRect(
                    j * oneBlockSize, //posición horizontal en píxeles
                    i * oneBlockSize, //posición vertical en píxeles
                    oneBlockSize, //ancho y alto del rectángulo 
                    oneBlockSize,
                    "#342DCA" //color para las paredes
                );
                // Si hay una pared a la izquierda de la celda actual
                if (j > 0 && map[i][j - 1] == 1) {
                     // Dibuja una línea horizontal interna entre esta celda y la de la izquierda
                    // Esto crea un "borde interno" para unir visualmente los bloques de pared
                    createRect(
                        j * oneBlockSize,  // Posición X: inicio del bloque actual
                        i * oneBlockSize + wallOffset,  // Posición Y: centrado verticalmente dentro del bloque
                        wallSpaceWidth + wallOffset,   // Ancho: pequeño espacio entre bloques
                        wallSpaceWidth,   // Alto: grosor de la línea
                        wallInnerColor     // Color: mismo que el color interno de la pared
                    );
                }

                // Si hay una pared a la derecha de la celda actual
                if (j < map[0].length - 1 && map[i][j + 1] == 1) {
                     // Dibuja una línea horizontal interna hacia la celda derecha
                    createRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth + wallOffset, //ancho de espacio de la conexion
                        wallSpaceWidth,
                        wallInnerColor //color del interior de la pared
                    );
                }

                if (i < map.length - 1 && map[i + 1][j] == 1) {
                    createRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth,
                        wallSpaceWidth + wallOffset,
                        wallInnerColor
                    );
                }

                if (i > 0 && map[i - 1][j] == 1) {
                    createRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize,
                        wallSpaceWidth,
                        wallSpaceWidth + wallOffset,
                        wallInnerColor
                    );
                }
            }
        }
    }
};

let drawGameOver = () => {
    // Establece el color de fondo
    canvasContext.fillStyle = "black";
    //Cubre todo el canvas con un color fondo 
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    // Texto "GAME OVER"
    canvasContext.font = "30px 'Pixelify Sans'"; //fuente
    canvasContext.fillStyle = "red"; //color de texto
    canvasContext.fillText("GAME OVER", 60, canvas.height / 2 - 20); //dibuja el texto en el centro del canvas

     // Cambia la fuente y el color para el mensaje secundario
    canvasContext.font = "20px 'Pixelify Sans'";
    canvasContext.fillStyle = "white";
    // Dibuja el mensaje para reiniciar el juego
    canvasContext.fillText("press f5 para jugar", 30, canvas.height / 2 + 30); //30px desde el borde iz del canvas, coloca el texto un poco debajo del centro vertical del canvas, asi aparece debajo del mensaje GO
};

    //Texto de Victoria
let drawVictory = () => {
    //establece el fondo negro
    canvasContext.fillStyle = "black";
    // Cubre todo el canvas con un fondo negro para limpiar lo anterior
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    canvasContext.font = "30px 'Pixelify Sans'"; //fuente y tamaño
    canvasContext.fillStyle = "#00FF00"; //establece el color
    canvasContext.fillText("¡GANASTE TODOS LOS NIVELES!", 10, canvas.height / 2); //muestra el mensaje de victoria en el centro 
};


let createGhosts = () => {
    //vacia el array de los ghosts actual - por si se esta reiniciando el nivel
    ghosts = [];
    for (let i = 0; i < ghostCount * 2; i++) { //crea el doble de fantasmas segun la cantidad en ghosts count
        let newGhost = new Ghost(//crea un nuevo objeto fantasma
            9 * oneBlockSize + (i % 2 == 0 ? 0 : 1) * oneBlockSize, //posicion X inicial del ghost
            //se alternan ligeramente entre 2 pos usando (i % 2)
            10 * oneBlockSize + (i % 2 == 0 ? 0 : 1) * oneBlockSize, //posicion Y
            oneBlockSize, //tamaño del fantasma
            oneBlockSize,
            pacman.speed / 2,
            ghostImageLocations[i % 4].x, //Srpite X en la hoja de img cambia cada 4 ghosts
            ghostImageLocations[i % 4].y, //Y en la hoja de IMG
            124, //ancho del recorte del srpite
            116, //alto
            6 + i //id del fantasma , puede ser usado para colores atc
        ); //agrega el nuevo fantasmas al array de ghosts
        ghosts.push(newGhost);
    }
};

let makeGhostsVulnerable = () => {
    //se establece el tiempo de vulnerabilidad en 3s
    ghostVulnerableTime = 3;

    //se marca cada fantasma como vulnerable 
    for (let ghost of ghosts) {
        ghost.isVulnerable = true;
    }

    // Si ya hay un temporizador corriendo, se limpia
    if (ghostVulnerableTimer !== null) {
        clearInterval(ghostVulnerableTimer);
    }

    // Nuevo temporizador que cuenta hacia atras
    ghostVulnerableTimer = setInterval(() => {
        //resta 1s al contador
        ghostVulnerableTime--;

        //si llega a 0 o menos se marca a todos los fantasmas como no vulnerables de nuevo
        if (ghostVulnerableTime <= 0) {
            for (let ghost of ghosts) {
                ghost.isVulnerable = false;
            }

            //se detiene el temp y se limpia
            clearInterval(ghostVulnerableTimer);
            ghostVulnerableTimer = null;
        }
    }, 1000); //se ejecutra el temp cada 1 segundo
};


//createNewPacman();
//createGhosts();
loadLevel(currentLevel); //carga el nivel actual del juego usando el numero almacenado en la variable
let gameInterval = setInterval(gameLoop, 1000 / fps); //inicia el bucle principal del juego GL usando SI, define cada cuantos milis se ejecuta GL

//Escucha cualquier tecla que se presione en la venta del navegador
window.addEventListener("keydown", (event) => {
    //guarda el codigo de la tecla presionada
    let k = event.keyCode;
    //usa un pequeño retraso de 1 milis para procesar la accion
    setTimeout(() => {
        //https://www.toptal.com/developers/keycode

        //si la tecla es flecha iz37 o "A"65
        if (k == 37 || k == 65) {       
            pacman.nextDirection = Direction_left;

        // Si la tecla es flecha arriba38 o "W"87
        } else if (k == 38 || k == 87) {
            pacman.nextDirection = Direction_up;
          
        // si la tecla es felcha derecha39 o D68    
        } else if (k == 39 || k == 68) {
            pacman.nextDirection = Direction_Right;

        //si la flecha es abajo40 o S83
        } else if (k == 40 || k == 83) {
            pacman.nextDirection = Direction_down;
        }
    }, 1); //se usa settimeout por compatibilidad o para evitar errores en el procesamiento inmediato
});
