// Poker
//
// jshint asi: true

class PokerJudge {
  static get_hand(cards) {
    let is_flush = PokerJudge.is_flush(cards)
    let is_straight = PokerJudge.is_straight(cards)
    
    let sames = PokerJudge.get_sames(cards)
    
    let max_count = 0
    sames.forEach(elem => max_count = Math.max(elem.count, max_count))
    
    let sub_strength = PokerJudge.get_sub_strength(cards)
    
    if (is_flush && is_straight) {
      return { name: 'STRAIGHT FLUSH', strength: 8, money: 50, sub_strength: sub_strength }
    }
    
    if (max_count == 4) {
      return { name: 'FOUR OF A KIND', strength: 7, money: 20, sub_strength: sub_strength }
    }
    if (max_count == 3 && sames.some(elem => elem.count == 2)) {
      return { name: 'FULL HOUSE', strength: 6, money: 7, sub_strength: sub_strength }
    }
    if (is_flush) {
      return { name: 'FLUSH', strength: 5, money: 5, sub_strength: sub_strength }
    }
    if (is_straight) {
      return { name: 'STRAIGHT', strength: 4, money: 4, sub_strength: sub_strength }
    }
    if (max_count == 3) {
      return { name: 'THREE OF A KIND', strength: 3, money: 3, sub_strength: sub_strength }
    }
    if (max_count == 2 && sames.length == 3) {
      return { name: 'TWO PAIR', strength: 2, money: 2, sub_strength: sub_strength }
    }
    if (max_count == 2) {
      return { name: 'ONE PAIR', strength: 1, money: 1, sub_strength: sub_strength }
    }
    return { name: 'HIGH CARDS', strength: 0, money: 1, sub_strength: sub_strength }
  }
  
  static is_flush(cards) {
    let is_flush = true
    let last_type
    cards.forEach(card => {
      if (last_type == null) {
        last_type = card.type
        return
      }
      if (last_type != card.type) {
        is_flush = false
      }
    })
    return is_flush
  }
  
  static is_straight(cards) {
    let nums = []
    let is_straight = true
    
    cards.forEach(card => {
      if (nums.includes(card.strength)) {
        is_straight = false
      }
      nums.push(card.strength)
    })
    
    let top_num
    nums.forEach(num => {
      let is_next_exist = nums.some(elem => { return elem == num + 1 })
      if (!is_next_exist) {
        if (top_num == null) {
          top_num = num
        } else {
          is_straight = false
        }
      }
    })
    
    return is_straight
  }
  
  static get_sames(cards) {
    let sames = []
    for (let i = 0; i < 13; i++) {
      let count = PokerJudge.get_same_count(cards, i)
      if (count > 0) {
        sames.push({ count: count, strength: i })
      }
    }
    return sames
  }
  
  static get_counts(cards) {
    let sames = PokerJudge.get_sames(cards)
    let counts = []
    sames.forEach(elem => {
      counts.push(elem.count)
    })
    return counts
  }
  
  static get_same_count(cards, num) {
    let cnt = 0
    cards.forEach(card => {
      if (card.strength == num) {
        cnt++
      }
    })
    return cnt
  }
  
  static get_sub_strength(cards) {
    let sames = PokerJudge.get_sames(cards)
    let max_count = Math.max(...PokerJudge.get_counts(cards))
    
    let max_strength = 0
    sames.forEach((elem) => {
      if (elem.count == max_count) {
        max_strength = Math.max(max_strength, elem.strength)
      }
    })
    
    return max_strength
  }
}