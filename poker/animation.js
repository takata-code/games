/*
animation.js
*/

/* jshint asi: true */

// TODO: 線形以外のアニメーションを実現

// アニメーション クラス
// 連続的に等間隔で処理を呼び出し、
// さまざまな要素をアニメーションできる
class Animation {
  // アニメーションの開始時、1度だけ呼び出される
  initialize() { }
  
  // アニメーションの係数 value,
  // 現在のフレームインデックス i,
  // 全てのフレームの数 len で呼び出される
  update(value, i, len) { }
  
  // 繰り返しのタイプを指定する
  // restart : はじめからもう一度
  // flap    : 折り返す
  repeatMode = 'restart'
  
  constructor() {
    
  }
  
  // アニメーションをスタート
  // time ミリ秒かけてアニメーション
  start(time, options) {
    options = options ? options : { }
    
    this.initialize()
    
    return new Promise(resolve => {
      const self = this
      const repeats = options.times ? options.times : 1
      let i = 0
      let flap = this.repeatMode == 'flap'
      
      let start_time = performance.now()
      let reverse = false
      function frame_onetime(frame_time) {
        if (frame_time - start_time >= time) {
          self.update(reverse ? 0 : 1)
           
          if (++i == repeats) {
            resolve()
            return
          } else {
            start_time = performance.now()
          }
        }
        reverse = flap && i % 2 == 1
        let a = (frame_time - start_time) / time
        self.update(reverse ? 1 - a : a)
        
        requestAnimationFrame(frame_onetime)
      }
      frame_onetime(start_time)
    })
  }
  
  static async direct(update, time, options) {
    let anim = new Animation()
    anim.update = update
    await anim.start(time, options)
  }
  
  
  
  
}