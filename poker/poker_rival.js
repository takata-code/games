// Poker
//
// jshint asi: true

class PokerRival {
  static select_change(cards) {
    // フラッシュかストレートなら交換しない
    if (PokerJudge.is_flush(cards) || PokerJudge.is_straight(cards)) {
      return
    }
    
    // 1枚しか同じ数字がないカードは交換
    let sames = PokerJudge.get_sames(cards)
    
    for (let i = 0; i < cards.length; i++) {
      let card = cards[i]
      
      let is_only = sames.some(elem => elem.count == 1 && elem.strength == card.strength)
      if (is_only && card.strength < 10) {
        cards[i].change = true
      }
    }
  }
}