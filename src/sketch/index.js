export default function sketch(s) {
  const BACKGROUND_COLOR = 10
  const STROKE_COLOR = [0, 0, 0, 0]
  const BLANK = 0
  const UP = 1
  const RIGHT = 2
  const DOWN = 3
  const LEFT = 4
  const OPTIONS = [BLANK, UP, RIGHT, DOWN, LEFT]; // ⋄ ⊥ ⊢ ⊤ ⊣

  const FRAME_RATE = 30;
  const SIZE = 500
  const DIMENSIONS = 20
  const TILE_SIZE = SIZE / DIMENSIONS
  const RULES = [
    [
      /***************/
      /*  B L A N K  */
      /***************/
      [BLANK, UP],
      [BLANK, RIGHT],
      [BLANK, DOWN],
      [BLANK, LEFT]
    ],
    [
      /*********/
      /*  U P  */
      /*********/
      [RIGHT, DOWN, LEFT],
      [UP, DOWN, LEFT],
      [BLANK, DOWN],
      [UP, RIGHT, DOWN]
    ],
    [
      /***************/
      /*  R I G H T  */
      /***************/
      [RIGHT, DOWN, LEFT],
      [UP, DOWN, LEFT],
      [UP, RIGHT, LEFT],
      [BLANK, LEFT]
    ],
    [
      /*************/
      /*  D O W N  */
      /*************/
      [BLANK, UP],
      [UP, DOWN, LEFT],
      [UP, RIGHT, LEFT],
      [UP, RIGHT, DOWN]
    ],
    [
      /*************/
      /*  L E F T  */
      /*************/
      [RIGHT, DOWN, LEFT],
      [BLANK, RIGHT],
      [UP, RIGHT, LEFT],
      [UP, RIGHT, DOWN]
    ]
  ]


  const tiles = []
  let grid


  const init = () => {
    s.background(BACKGROUND_COLOR);
    grid = [...Array(DIMENSIONS * DIMENSIONS).keys()]
      .map((_, i) => ({
        collapsed: false,
        isVisible: false,
        x: i % DIMENSIONS,
        y: Math.floor(i / DIMENSIONS),
        options: [...OPTIONS],
        reference: "⋄ ⊥ ⊢ ⊤ ⊣"
      }))
  }

  const getOffset = (coord) => coord * TILE_SIZE

  const sortRandom = () => Math.random() - 0.5

  const pickCollapsable = () => grid.filter(cell => !cell.collapsed)

  const pickCellWithLeastEntropy = (candidates) => {
    if ([!candidates, !candidates.length].includes(true)) return
    return candidates
      .sort(sortRandom)
      .reduce((acc, cell) => acc.options.length < cell.options.length ? acc : cell)
  }

  const collapse = (cell) => {
    cell.collapsed = true
    cell.options = [cell.options.sort(sortRandom)[0]]
    try {
      updateNeighbors(cell)
      drawCell(cell)
    } catch (error) {
      init()
    }
  }

  const updateNeighbors = (cell) => {
    const neighbors = getNeighbors(cell)
    const validOptions = getRules(cell)
    neighbors.forEach((neighbor, index) => {
      if (!validOptions) throw `validOptions: ${validOptions}, neighbor: ${JSON.stringify(neighbor)}, cell: ${JSON.stringify(cell)}`
      if (!neighbor || neighbor.collapsed) return
      const rule = validOptions[index]
      neighbor.options = neighbor.options.filter(option => rule.includes(option))
      drawEntropy(neighbor)
    })
  }

  const getRules = (cell) => RULES[cell.options[0]]

  const drawCell = (cell) => {
    if ([!cell, !cell.options, cell.options.length == 0].includes(true)) throw `cell: ${JSON.stringify(cell)}`
    cell.isVisible = true
    s.image(tiles[cell.options[0]], getOffset(cell.x), getOffset(cell.y), TILE_SIZE, TILE_SIZE)
  }

  const drawEntropy = (cell) => {
    s.fill(50 * cell.options.length)
    s.rect(getOffset(cell.x), getOffset(cell.y), TILE_SIZE, TILE_SIZE)
  }

  const previous = (coord) => coord == 0 ? 0 : coord - 1
  const next = (coord) => ++coord == DIMENSIONS ? --coord : coord

  const getNeighbors = (cell) => [
    [cell.x, previous(cell.y)],
    [next(cell.x), cell.y],
    [cell.x, next(cell.y)],
    [previous(cell.x), cell.y],
  ].map(coord => getCell(...coord))

  const getCell = (x, y) => grid[y * DIMENSIONS + x]
  s.preload = () => {
    tiles[BLANK] = s.loadImage('assets/tiles/demo/blank.png')
    tiles[UP] = s.loadImage('assets/tiles/demo/up.png')
    tiles[RIGHT] = s.loadImage('assets/tiles/demo/right.png')
    tiles[DOWN] = s.loadImage('assets/tiles/demo/down.png')
    tiles[LEFT] = s.loadImage('assets/tiles/demo/left.png')
  }

  s.setup = () => {
    s.frameRate(FRAME_RATE)
    s.createCanvas(SIZE, SIZE)
    s.stroke(STROKE_COLOR)
    init()
  }

  s.draw = () => {
    const candidate = pickCellWithLeastEntropy(pickCollapsable())
    if (!candidate) return
    collapse(candidate)
    // s.noLoop()
  }
}
