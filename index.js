// reference to canvas element
const canvas = document.querySelector('#myCanvas')
// context acts as the renderer, used to draw on canvas
const ctx = canvas.getContext('2d')

/**********
 * Example 
 **********/

// red square
//
// ctx.beginPath()
// ctx.rect(20, 40, 50, 50)
// ctx.fillStyle = '#FF0000'
// ctx.fill()
// ctx.closePath()
//
// green circle
//
// ctx.beginPath()
// ctx.arc(240, 160, 40, 0, Math.PI * 2)
// ctx.fillStyle = 'green'
// ctx.fill()
// ctx.closePath()
//
// blue rectangle with outline
//
// ctx.beginPath()
// ctx.rect(160, 10, 100, 40)
// ctx.strokeStyle = "rgba(0, 0, 255, 1)"
// ctx.stroke()
// ctx.closePath()

/*******
 * Ball
 *******/

let ball = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    radius: 10
}

let ballMoveX = 2
let ballMoveY = -2

// draw ball
const drawBall = () => {
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    ctx.fillStyle = '#0095DD'
    ctx.fill()
    ctx.closePath()
}

/********* 
 * Paddle
 *********/

let paddle = {
    x: (canvas.width - 75) / 2,
    y: canvas.height - 20,
    width: 75,
    height: 10
}

// draw paddle
const drawPaddle = () => {
    ctx.beginPath()
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height)
    ctx.fillStyle = '#0095DD'
    ctx.fill()
    ctx.closePath()
}

// handle paddle movement
const keyDownHandler = (e) => {
    let distance = 7
    if (e.key == 'ArrowRight') paddle.x = Math.min(paddle.x + distance, canvas.width - paddle.width)
    if (e.key == 'ArrowLeft') paddle.x = Math.max(paddle.x - distance, 0)
}

const mouseHandler = (e) => {
    let mouseX = e.clientX - canvas.offsetLeft
    if (
        mouseX > (paddle.width / 2) &&
        mouseX < (canvas.width - (paddle.width / 2))
    ) {
        paddle.x = mouseX - (paddle.width / 2)
    }
}

// listen for keyboard event
document.addEventListener('keydown', keyDownHandler)
document.addEventListener('mousemove', mouseHandler)

/*********
 * Bricks
 *********/

const brickConfig = {
    rowCount: 3,
    colCount: 5,
    width: 75,
    height: 20,
    padding: 10,
    offset: 30
}

const brickArr = []
for (let row = 0; row < brickConfig.rowCount; row++) {
    brickArr[row] = []
    for (let col = 0; col < brickConfig.colCount; col++) {
        brickArr[row][col] = {
            x: (col * (brickConfig.width + brickConfig.padding)) + brickConfig.offset,
            y: (row * (brickConfig.height + brickConfig.padding)) + brickConfig.offset,
            // hit: false
        }
    }
}

const drawBricks = () => {
    for (let row = 0; row < brickConfig.rowCount; row++) {
        for (let col = 0; col < brickConfig.colCount; col++) {
            let brick = brickArr[row][col]
            if (!brick.hit) {
                ctx.beginPath()
                ctx.rect(brick.x, brick.y, brickConfig.width, brickConfig.height)
                ctx.fillStyle = '#0095DD'
                ctx.fill()
                ctx.closePath()
            } else { ctx.clearRect(brick.x, brick.y, brickConfig.width, brickConfig.height) }
        }
    }
}

/**************
 * Score/Lives
 **************/
let score = 0
let lives = 3

const drawScore = () => {
    ctx.font = '16px Arial'
    ctx.fillStyle = 'black'
    ctx.fillText(`Score: ${score}`, 8, 20)
}

const drawLives = () => {
    ctx.font = '16px Arial'
    ctx.fillStyle = 'black'
    ctx.fillText(`Lives: ${lives}`, 128, 20)
}

/*********
 * Canvas
 *********/

// draw canvas
const drawCanvas = () => {
    let boundaryX = canvas.width - ball.radius
    let boundaryY = canvas.height - ball.radius
    let newBallPos = { x: ball.x + ballMoveX, y: ball.y + ballMoveY }

    // wall collision
    if ((newBallPos.x < 0) || ((ball.x + ballMoveX) > boundaryX)) { ballMoveX = -ballMoveX }
    if (newBallPos.y < 0) { ballMoveY = -ballMoveY }

    // paddle collision
    if (
        (newBallPos.x < (paddle.x + paddle.width)) &&
        (newBallPos.x > paddle.x) &&
        (newBallPos.y == paddle.y)
    ) {
        ballMoveY = -ballMoveY
        if (newBallPos.x < (paddle.x + paddle.width / 3)) {
            ballMoveX = -2
        }
        else if (newBallPos.x > (paddle.x + (2 * paddle.width / 3))) {
            ballMoveX = 2
        } else { ballMoveX = 0 }
    }

    // brick collision
    for (let row = 0; row < brickConfig.rowCount; row++) {
        for (let col = 0; col < brickConfig.colCount; col++) {
            let brick = brickArr[row][col]
            if (
                !brick.hit &&
                (newBallPos.x < (brick.x + brickConfig.width)) &&
                (newBallPos.x > brick.x) &&
                (newBallPos.y < (brick.y + brickConfig.height)) &&
                (newBallPos.y > brick.y)
            ) {
                ballMoveY = -ballMoveY
                brick.hit = true
                score++
            }
        }
    }

    // gameover
    if (score === (brickConfig.rowCount * brickConfig.colCount)) {
        window.alert(`Congratulations`)
        clearInterval(redrawInterval)
    }

    if (((newBallPos.y) > boundaryY)) {
        lives -= 1
        ball.x = canvas.width / 2
        ball.y = canvas.height - 30
        ballMoveX = 0
        ballMoveY = 0
        if (!lives) {
            clearInterval(redrawInterval)
            let retry = window.confirm(`Game Over, try again?`)
            if (retry) document.location.reload()
        } else {
            window.alert(`Try Again`)
            ballMoveX = 2
            ballMoveY = -2
        }
    }

    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawScore()
    drawLives()
    drawBricks()
    drawPaddle()
    drawBall()

    ball.x += ballMoveX
    ball.y += ballMoveY
}

// update canvas every 10ms
let redrawInterval = setInterval(drawCanvas, 10)