// Poker
//
// jshint asi: true

class Poker {
  canvas
  ctx
  width = 1920
  height = 1080
  images = { }
  
  is_gaming = false
  input_enabled = true
  can_change = false
  can_bet = false
  
  bet_button_astate = 0
  bet_text_astate = 1
  
  is_messaging = false
  message_text
  
  cards
  rest_cards
  
  rival_cards
  player_cards
  
  max_changes = 2
  rest_changes
  
  result_mode = 0
  
  start_money = 50
  money
  bet = 0
  
  constructor(canvas_id) {
    this.canvas = document.getElementById(canvas_id)
    this.ctx = this.canvas.getContext('2d')
    
    this.start()
  }
  
  async start() {
    // トランプの基本データを生成
    this.create_cards()
    
    // クリックイベントをハンドル
    this.canvas.addEventListener('click', async (e) => {
      let input_scale = this.canvas.width / this.canvas.offsetWidth
      await this.onclick(e.offsetX * input_scale, e.offsetY * input_scale)
    })
    
    let self = this
    function loop() {
      self.update()
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
    
    this.money = this.start_money
    
    let anim = new Animation()
    anim.repeatMode = 'flap'
    anim.update = (a) => {
      this.bet_button_astate = a
    }
    anim.start(1000, { times: Infinity })
  }
  
  async next_round() {
    this.is_gaming = true
    this.create_rest_cards()
    this.bet = 1
    
    this.player_cards = []
    this.rival_cards = []
    await this.prepare_cards()
    await Animation.direct((a) => this.bet_text_astate = (1 - a), 500)
    this.rest_changes = this.max_changes
    this.can_bet = true
  }
  
  create_rest_cards() {
    this.rest_cards = []
    this.cards.forEach(card => {
      this.rest_cards.push(Object.assign({ }, card))
    })
  }
  
  create_cards() {
    this.create_cards_images()
    
    this.cards = []
    
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 13; j++) {
        let card = {
          type: i,
          strength: (j + 12) % 13,
          image: this.images[`card_${i}_${j}`],
          width: 232,
          height: 356,
          scale: 0.8,
          x: 0,
          y: 0,
          change: false,
          is_showed: true
        }
        this.cards.push(card)
      }
    }
  }
  
  create_cards_images() {
    let image_paths = [
      'cards/card_0_0.png',
      'cards/card_0_1.png',
      'cards/card_0_2.png',
      'cards/card_0_3.png',
      'cards/card_0_4.png',
      'cards/card_0_5.png',
      'cards/card_0_6.png',
      'cards/card_0_7.png',
      'cards/card_0_8.png',
      'cards/card_0_9.png',
      'cards/card_0_10.png',
      'cards/card_0_11.png',
      'cards/card_0_12.png',
      
      'cards/card_1_0.png',
      'cards/card_1_1.png',
      'cards/card_1_2.png',
      'cards/card_1_3.png',
      'cards/card_1_4.png',
      'cards/card_1_5.png',
      'cards/card_1_6.png',
      'cards/card_1_7.png',
      'cards/card_1_8.png',
      'cards/card_1_9.png',
      'cards/card_1_10.png',
      'cards/card_1_11.png',
      'cards/card_1_12.png',
      
      'cards/card_2_0.png',
      'cards/card_2_1.png',
      'cards/card_2_2.png',
      'cards/card_2_3.png',
      'cards/card_2_4.png',
      'cards/card_2_5.png',
      'cards/card_2_6.png',
      'cards/card_2_7.png',
      'cards/card_2_8.png',
      'cards/card_2_9.png',
      'cards/card_2_10.png',
      'cards/card_2_11.png',
      'cards/card_2_12.png',
      
      'cards/card_3_0.png',
      'cards/card_3_1.png',
      'cards/card_3_2.png',
      'cards/card_3_3.png',
      'cards/card_3_4.png',
      'cards/card_3_5.png',
      'cards/card_3_6.png',
      'cards/card_3_7.png',
      'cards/card_3_8.png',
      'cards/card_3_9.png',
      'cards/card_3_10.png',
      'cards/card_3_11.png',
      'cards/card_3_12.png',
      'cards/card_back.png'
      ]
      
      image_paths.forEach((path, i) => {
        this.create_image(i < 4 * 13 ? ('card_' + Math.floor(i / 13) + '_' + i % 13) : 'card_back', path)
      })
      
      this.create_image('coin_1', 'coins/coin_1.png')
      this.create_image('coin_5', 'coins/coin_5.png')
      this.create_image('coin_10', 'coins/coin_10.png')
      this.create_image('coin_50', 'coins/coin_50.png')
      this.create_image('coin_100', 'coins/coin_100.png')
      this.create_image('coin_500', 'coins/coin_500.png')
      this.create_image('cloth', 'cloth.png')
  }
  
  create_image(id, path) {
    let img = document.createElement('img')
    img.src = path
    this.images[id] = img
  }
  
  async prepare_cards() {
    for (let i = 0; i < 5; i++) {
      let player_card = Object.assign(this.get_random_card(), this.get_card_place(true, i))
      let rival_card = Object.assign(this.get_random_card(), this.get_card_place(false, i))
      
      player_card.is_showed = false
      rival_card.is_showed = false
      
      player_card.y += 500
      rival_card.y -= 500
      
      this.player_cards.push(player_card)
      this.rival_cards.push(rival_card)
    }
    
    for (let i = 0; i < 5; i++) {
      let player_card = this.player_cards[i]
      let rival_card = this.rival_cards[i]
      
      let py = player_card.y
      let ry = rival_card.y
      
      Animation.direct((a) => {
        player_card.y = py - a * 500
        rival_card.y = ry + a * 500
      }, 300)
      
      await sleep(200)
    }
    await sleep(500)
  }
  
  async show_player_cards() {
    for (let i = 0; i < this.player_cards.length; i++) {
      this.kurutto(this.player_cards[i])
      await sleep(180)
    }
    await sleep(500)
    
    await this.sort_cards(this.player_cards)
  }
  
  async hide_cards() {
    for (let i = 0; i < 5; i++) {
      let player_card = this.player_cards[i]
      let rival_card = this.rival_cards[i]
      
      let py = player_card.y
      let ry = rival_card.y
      
      Animation.direct((a) => {
        player_card.y = py + a * 500
        rival_card.y = ry - a * 500
      }, 300)
      
      await sleep(200)
    }
    await sleep(600)
  }
  
  async sort_cards(cards) {
    let sorted_cards = []
    let sorted_index = []
    for (let i = 0; i < cards.length; i++) {
      let card = cards[i]
      
      if (sorted_cards.length == 0) {
        sorted_cards.push(card)
        sorted_index.push(i)
        continue
      }
      
      for (let j = 0; j < sorted_cards.length; j++) {
        if (card.strength < sorted_cards[j].strength) {
          sorted_cards.splice(j, 0, card)
          sorted_index.splice(j, 0, i)
          break
        }
        if (j == sorted_cards.length - 1) {
          sorted_cards.push(card)
          sorted_index.push(i)
          break
        }
      }
    }
    
    for (let i = 0; i < cards.length; i++) {
      let card = cards[i]
      let next_place = this.get_card_place(true, sorted_index.indexOf(i))
      
      let card_x = card.x
      
      Animation.direct((a) => {
        a = (-Math.cos(a * Math.PI) + 1) / 2
        card.x = card_x + (next_place.x - card_x) * a
      }, 500)
    }
    
    cards.forEach((_, i) => {
      cards[i] = sorted_cards[i]
    })
    
    
    await sleep(1000)
  }
  
  get_card_place(is_player, index) {
    return { x: 1100 + (-2 + index) * 240, y: is_player ? this.height - 200 : 200, is_back: !is_player }
  }
  
  get_random_card() {
    let card_index = Math.floor(Math.random() * this.rest_cards.length)
    let card = this.rest_cards[card_index]
    card.change = false
    this.rest_cards.splice(card_index, 1)
    return card
  }
  
  async onclick(x, y) {
    if (!this.input_enabled) {
      return
    }
    
    this.input_enabled = false
    if (this.is_gaming) {
      // カードを押すと縦に動く
      for (let i = 0; i < this.player_cards.length; i++) {
        let card = this.player_cards[i]
        
        if (this.hittest_card(x, y, card) && this.can_change) {
          card.change = !card.change
          
          let self = this
          await Animation.direct((a) => {
            a = Math.pow(a - 1, 3) + 1
            let movement = card.change ?  100 * a : 100 * (1 - a)
            card.y = self.get_card_place(true, i).y - movement
          }, 180)
        }
      }
      // CHANGE ボタン
      if (this.hittest(x, y, 1100, 540, 1000, 100) && this.can_change) {
        this.can_change = false
        await this.change(this.player_cards, true)
        await this.rival_change()
        
        if (this.rest_changes == 0) {
          await this.show_result()
          
          if (this.money == 0) {
            await this.game_over()
            this.is_gaming = false
            this.money = this.start_money
          } else {
            await this.next_round()
          }
        } else {
          this.can_change = true
        }
      }
      
      // BET ボタン
      if (this.can_bet) {
        let bet_amount = 0
        if (this.hittest(x, y, 250 - 120, 450, 100, 100)) {
          bet_amount = 1
        }
        if (this.hittest(x, y, 250, 450, 100, 100)) {
          bet_amount = 5
        }
        if (this.hittest(x, y, 250 + 120, 450, 100, 100)) {
          bet_amount = 10
        }
        if (this.hittest(x, y, 250 - 120, 570, 100, 100)) {
          bet_amount = 50
        }
        if (this.hittest(x, y, 250, 570, 100, 100)) {
          bet_amount = 100
        }
        if (this.hittest(x, y, 250 + 120, 570, 100, 100)) {
          bet_amount = 500
        }
        
        if (this.hittest(x, y, 250, 690, 360, 96)) {
          this.can_bet = false
          this.can_change = true
          
          Animation.direct((a) => this.bet_text_astate = a, 1200)
          
          await this.show_player_cards()
        }
        
        if (this.money - (this.bet + bet_amount) >= 0) {
          this.bet += bet_amount
        } else {
          
        }
      }
    } else {
      // START ボタン
      if (this.hittest(x, y, 960, 720, 720, 200)) {
        await this.next_round()
      }
    }
    this.input_enabled = true
  }
  
  async kurutto(card) {
    let anim = new Animation()
    let card_width = card.width
    anim.update = (a) => {
      a = Math.cos(a * Math.PI / 2)
      card.width = card_width * a
    }
    await anim.start(160)
    card.is_showed = true
    
    anim.update = (a) => {
      a = Math.sin(a * Math.PI / 2)
      card.width = card_width * a
    }
    await anim.start(160)
  }
  
  async change(cards, is_player) {
    if (is_player) {
      this.rest_changes--
    }
    
    let is_changed_card_exists = false
    for (let i = 0; i < cards.length; i++) {
      let card = cards[i]
      if (card.change) {
        is_changed_card_exists = true
        
        let new_card = this.get_random_card()
        Object.assign(new_card, this.get_card_place(is_player, i))
        new_card.is_showed = false
        let self = this
        async function itte_modoru() {
          let anim = new Animation()
          let card_y = card.y
          anim.update = (a) => {
            card.y = card_y + a * (is_player ? 500 : -500)
          }
          await anim.start(240)
          cards[i] = new_card
          
          card_y = new_card.y
          anim.update = (a) => {
            new_card.y = card_y + (1 - a) * (is_player ? 500 : -500)
          }
          await anim.start(240)
          
          if (is_player) {
            await self.kurutto(new_card)
          }
        }
        
        itte_modoru()
        
        await sleep(100)
        
      }
    }
    
    if (is_changed_card_exists) {
      await sleep(1200)
    } else {
      for (let i = 0; i < cards.length; i++) {
        let card = cards[i]
        
        let card_y = card.y
        Animation.direct((a) => {
          a = (-Math.cos(a * Math.PI * 2) + 1) / 2
          card.y = card_y + a * (is_player ? 36 : -36)
        }, 500)
      }
      
      await sleep(500)
    }
    await this.sort_cards(cards)
  }
  
  async rival_change() {
    PokerRival.select_change(this.rival_cards)
    await this.change(this.rival_cards, false)
  }
  
  async show_result() {
    for (let i = 0; i < this.rival_cards.length; i++) {
      await sleep(100)
      let card = this.rival_cards[i]
      
      await this.kurutto(card)
    }
    
    await this.sort_cards(this.rival_cards)
    
    await sleep(500)
    
    this.result_mode = 1
    
    await sleep(2000)
    
    this.result_mode = 2
    
    let player_hand = PokerJudge.get_hand(this.player_cards)
    let rival_hand = PokerJudge.get_hand(this.rival_cards)
    let is_winner = false
    if (player_hand.strength > rival_hand.strength) {
      is_winner = true
    }
    if (player_hand.strength == rival_hand.strength && player_hand.sub_strength >= rival_hand.sub_strength) {
      is_winner = true
    }
    let money_increment = (is_winner ? player_hand.money : -1) * this.bet
    let this_money = this.money
    
    await Animation.direct((a) => {
      this.money = Math.floor(this_money + money_increment * a)
    }, 1200)
    await sleep(1200)
    
    this.result_mode = 0
    
    await this.hide_cards()
  }
  
  async game_over() {
    this.message('GAME OVER!')
    await sleep(3000)
  }
  
  hittest(x, y, sx, sy, swidth, sheight) {
    let left = sx - swidth / 2
    let right = sx + swidth / 2
    let top = sy - sheight / 2
    let bottom = sy + sheight / 2
    
    return (left <= x && x < right) && (top <= y && y < bottom)
  }
  
  hittest_card(x, y, card) {
    return this.hittest(x, y, card.x, card.y, card.width * card.scale, card.height * card.scale)
  }
  
  update(deltatime) {
    this.draw()
  }
  
  async message(text) {
    this.message_text = text
    this.is_messaging = true
    await sleep(1800)
    this.is_messaging = false
  }
  
  draw() {
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    
    this.ctx.drawImage(this.images.cloth, 0, 0, 1920, 1080)
    
    if (this.is_gaming) {
      // カードを描画
      const card_margin = 240
      for (let i = 0; i < 5; i++) {
        this.draw_card(this.player_cards[i])
        this.draw_card(this.rival_cards[i])
      }
      
      // CHANGE ボタン
      if (this.can_change) {
        this.draw_change_button()
      }
      
      // BET ボタン
      this.draw_bet()
      this.draw_bet_button()
      
      // 金の量
      this.ctx.fillStyle = '#eeeeee'
      this.ctx.strokeStyle = '#000000aa'
      this.ctx.lineWidth = 8
      this.ctx.font = 'bold 72px Rockwell'
      let money_text = '$ ' + this.money
      this.ctx.strokeText(money_text, 270, 900)
      this.ctx.fillText(money_text, 270, 900)
      
      // 結果表示
      if (this.result_mode) {
        this.draw_result()
      }
    } else {
      this.ctx.fillStyle = '#e89a25'
      this.ctx.beginPath()
      this.ctx.roundRect(960 - 360, 720, 720, 200, 100)
      this.ctx.fill()
      this.ctx.font = 'bold 72px Rockwell'
      this.ctx.lineWidth = 8
      this.ctx.strokeStyle = 'black'
      this.ctx.fillStyle = '#eeeeee'
      this.ctx.strokeText('PLAY', 960, 820)
      this.ctx.fillText('PLAY', 960, 820)
      
      
      this.ctx.font = 'bold 256px Rockwell'
      this.ctx.lineWidth = 36
      this.ctx.strokeStyle = 'black'
      this.ctx.fillStyle = '#eeeeee'
      this.ctx.strokeText('P O K E R', 960, 400)
      this.ctx.fillText('P O K E R', 960, 400)
    }
    
    if (this.is_messaging) {
      let lines = this.message_text.split('\n')
      let len = lines.length
      lines.forEach((line, i) => {
        let a = length % 2 == 0 ? i - length / 2 - 0.5 : i - length / 2
        this.ctx.fillStyle = '#eeeeee'
        this.ctx.strokeStyle = '#000000'
        this.ctx.font = 'bold 144px Rockwell'
        this.ctx.save()
        this.ctx.shadowColor = '#000000'
        this.ctx.shadowBlur = 100
        this.ctx.fillText(line, 960, 540 + 100 * a)
        this.ctx.restore()
        this.ctx.lineWidth = 8
        this.ctx.strokeText(line, 960, 540 + 100 * a)
        this.ctx.fillText(line, 960, 540 + 100 * a)
      })
    }
  }
  
  draw_result() {
    let player_hand = PokerJudge.get_hand(this.player_cards)
    let rival_hand = PokerJudge.get_hand(this.rival_cards)
    
    if (this.result_mode == 1) {
      // 互いの手を表示
      this.ctx.fillStyle = '#eeeeee'
      this.ctx.strokeStyle = '#154a1b'
      this.ctx.lineWidth = 24
      
      this.ctx.font = 'bold 100px Rockwell'
      
      let player_text = player_hand.name
      let rival_text = rival_hand.name
      
      if (player_hand.strength == rival_hand.strength) {
        let chars = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
        
        player_text += ` (${chars[player_hand.sub_strength]})`
        rival_text += ` (${chars[rival_hand.sub_strength]})`
      }
      
      this.ctx.strokeText(player_text, 960, 1080 - 200)
      this.ctx.fillText(player_text, 960, 1080 - 200)
      
      this.ctx.strokeText(rival_text, 960, 200)
      this.ctx.fillText(rival_text, 960, 200)
    } else {
      // YOU WIN または YOU LOSE を表示
      this.ctx.fillStyle = '#eeeeee'
      this.ctx.lineWidth = 24
      
      let is_winner = false
      if (player_hand.strength > rival_hand.strength) {
        is_winner = true
      }
      if (player_hand.strength == rival_hand.strength && player_hand.sub_strength >= rival_hand.sub_strength) {
        is_winner = true
      }
      this.ctx.strokeStyle = is_winner ? '#e89a25' : '#2b2ba6'
      let text = is_winner ? 'YOU WIN' : 'YOU LOSE'
      
      this.ctx.font = 'bold 100px Rockwell'
      
      this.ctx.strokeText(text, 960, 440)
      this.ctx.fillText(text, 960, 440)
      
      let money_increment = (is_winner ? player_hand.money : -1) * this.bet
      text = (money_increment > 0 ? '+ $ ' : '- $') + Math.abs(money_increment)
      this.ctx.strokeText(text, 960, 560)
      this.ctx.fillText(text, 960, 560)
    }
  }
  
  draw_change_button() {
    let change_exists = this.player_cards.some((card) => card.change)
    this.ctx.fillStyle = change_exists ? '#e8ac3c' : '#18c42c'
    this.ctx.beginPath()
    this.ctx.roundRect(1100 - 500, 540 - 50, 1000, 100, 50)
    this.ctx.fill()
    this.ctx.fillStyle = '#eeeeee'
    this.ctx.font = '54px Rockwell'
    this.ctx.fillText(change_exists ? 'CHANGE' : 'NOT CHANGE', 1100, 540)
  }
  
  draw_bet_button() {
    this.ctx.globalAlpha = 1 - this.bet_text_astate
    
    this.ctx.lineWidth = 8
    this.ctx.strokeStyle = `rgba(232, 172, 60, ${this.bet_button_astate})`
    this.ctx.strokeRect(250 - 200, 400 - 360, 400, 720)
    
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 2; y++) {
        let dollars = [1, 5, 10, 50, 100, 500][y * 3 + x]
        this.ctx.save()
        if (this.bet + dollars > this.money) {
          this.ctx.globalAlpha *= 0.5
        }
        this.ctx.drawImage(this.images['coin_' + dollars], 250 - 50 + (x - 1) * 120, 400 + y * 120, 100, 100)
        this.ctx.restore()
      }
    }
    
    this.ctx.fillStyle = '#e8ac3c'
    this.ctx.beginPath()
    this.ctx.roundRect(250 - 180, 690 - 48, 360, 96, 48)
    this.ctx.fill()
    this.ctx.fillStyle = '#eeeeee'
    this.ctx.font = 'bold 48px Rockwell'
    this.ctx.fillText('BET', 250, 690 + 8)
    
    this.ctx.globalAlpha = 1
  }
  
  draw_bet() {
    this.ctx.fillStyle = '#00000044'
    this.ctx.fillRect(250 - 200, 400 - 360, 400, 720 - this.bet_text_astate * 300)
    
    this.ctx.fillStyle = '#eeeeee'
    this.ctx.strokeStyle = '#000000aa'
    this.ctx.lineWidth = 8
    this.ctx.font = 'bold 72px Rockwell'
    let money_text = '$ ' + this.bet
    this.ctx.strokeText(money_text, 250, 300)
    this.ctx.fillText(money_text, 250, 300)
    
    this.ctx.fillStyle = '#eeeeee'
    this.ctx.font = '48px Rockwell'
    this.ctx.fillText('BET', 120, 100)
  }
  
  draw_card(card) {
    let image = card.is_showed ? card.image : this.images.card_back
    let dx = card.x - (card.width * card.scale) / 2
    let dy = card.y - (card.height * card.scale) / 2
    
    let dwidth = card.width * card.scale
    let dheight = card.height * card.scale
    
    this.ctx.save()
    
    this.ctx.shadowColor = '#00000044'
    this.ctx.shadowBlur = 50
    
    if (card.is_back) {
      this.ctx.translate(card.x, card.y)
      this.ctx.rotate(Math.PI)
      this.ctx.translate(-card.x, -card.y)
    }
    
    this.ctx.drawImage(image, dx, dy, dwidth, dheight)
    
    this.ctx.restore()
  }
}

function sleep(miliseconds) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, miliseconds)
  })
}



