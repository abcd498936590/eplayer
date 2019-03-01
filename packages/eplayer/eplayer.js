class Eplayer extends HTMLElement {
  constructor() {
    super()
    this.src = this.getAttribute('src')
    this.init()
    this.stream()
  }

  static get observedAttributes() {
    return ['src']
  }

  attributeChangedCallback(name, _, newVal) {
    if (name === 'src') this.src = this.$('.video').src = newVal
    this.stream()
    this.video.load()
  }

  waiting() {
    this.$('.mark').classList.remove('playing')
    this.$('.mark').classList.add('loading')
  }

  stream() {
    let type = this.src && this.src.includes('m3u8') ? 'm3u8' : null
    switch (type) {
      case 'hls':
        if (Hls.isSupported()) {
          let hls = new Hls()
          hls.loadSource(this.src)
          hls.attachMedia(this.video)
        }
        break
    }
  }

  canplay() {
    this.$('.mark').classList.remove('loading')
    this.$('.mark').classList.add('playing')
    this.$('.playing').onclick = () => {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.play()
      }, 200)
    }
    this.$('.total').innerHTML = getTimeStr(this.video.duration)
  }

  play() {
    if (this.video.paused) {
      this.video.play()
      this.$('.ep-video').style.display = 'none'
      this.$('.is-play').classList.replace('ep-play', 'ep-pause')
    } else {
      this.video.pause()
      this.$('.ep-video').style.display = 'block'
      this.$('.is-play').classList.replace('ep-pause', 'ep-play')
    }
  }

  volume() {
    if (this.video.muted) {
      this.video.muted = false
      setVolume(this.video.volume * 10, this.$('.line'))
      this.$('.is-volume').classList.replace('ep-volume-off', 'ep-volume')
    } else {
      this.video.muted = true
      setVolume(0, this.$('.line'))
      this.$('.is-volume').classList.replace('ep-volume', 'ep-volume-off')
    }
  }

  update() {
    let cTime = getTimeStr(this.video.currentTime)
    if (this.video.buffered.length) {
      let bufferEnd = this.video.buffered.end(this.video.buffered.length - 1)
      this.$('.buffer').style.width =
        (bufferEnd / this.video.duration) * this.$('.progress').clientWidth +
        'px'
    }
    let offset =
      (this.video.currentTime / this.video.duration) * this.$('.bg').clientWidth
    this.$('.now').innerHTML = cTime
    this.$('.current').style.width = offset + 'px'
  }

  progress(e) {
    let offset = e.offsetX / this.$('.progress').offsetWidth
    this.video.currentTime = this.video.duration * offset
  }

  down(e) {
    e.stopPropagation()
    this.disX = e.clientX - this.$('.cycle').offsetLeft
    document.onmousemove = e => this.move(e)
    document.onmouseup = () => {
      e.stopPropagation()
      document.onmousemove = null
      document.onmouseup = null
    }
  }

  move(e) {
    e.stopPropagation()
    let offset = e.clientX - this.disX + 7
    if (offset < 0) offset = 0
    if (offset > this.$('.progress').clientWidth)
      offset = this.$('.progress').clientWidth
    this.$('.current').style.width = offset + 'px'
    this.video.currentTime =
      (offset / this.$('.progress').clientWidth) * this.video.duration
    document.onmousemove = null
    setTimeout(
      (document.onmousemove = e => {
        if (e) this.move(e)
      }),
      30
    )
  }

  alow() {
    clearTimeout(this.timer)
    this.$('.controls').style.bottom = 0
    this.$('.ep-video').style.bottom = 70 + 'px'
    this.timer = setTimeout(() => {
      this.$('.controls').style.bottom = -50 + 'px'
      this.$('.ep-video').style.bottom = 25 + 'px'
    }, 5000)
  }

  keydown(e) {
    if (e && e.keyCode == 37) this.video.currentTime -= 10
    if (e && e.keyCode == 39) this.video.currentTime += 10
    if (e && e.keyCode == 38) this.video.volume = parseInt(this.video.volume*100)/100 + 0.05
    if (e && e.keyCode == 40) this.video.volume = parseInt(this.video.volume*100)/100 - 0.05
    if (e && e.keyCode == 32) this.play()
    
    let index = Math.floor(this.video.volume * 10)
    setVolume(index, this.$('.line'))
    return false
  }

  ended() {
    this.$('.is-play').classList.replace('ep-pause', 'ep-play')
  }

  full() {
    if (isFullScreen()) {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }
    } else {
      let el = this.$('.eplayer')
      let rfs =
        el.requestFullScreen ||
        el.webkitRequestFullScreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullscreen
      return rfs.call(el)
    }
  }

  init() {
    let link = document.createElement('link')
    link.setAttribute(
      'href',
      'https://at.alicdn.com/t/font_836948_6lbb2iu59.css'
    )
    link.setAttribute('rel', 'stylesheet')
    document.head.appendChild(link)
    let html = `
      <style>
        @import "https://at.alicdn.com/t/font_836948_6lbb2iu59.css";
        *{
          padding:0;
          margin:0;
        }
        .eplayer,video{
          height:100%;
          width:100%;
          color:var(--icons,rgba(255,255,255,0.6));
          font-size:12px;
        }
        .eplayer{
          user-select:none;
          position: relative;
          overflow: hidden;
        }
        .controls{
          position:absolute;
          left:0;
          right:0;
          bottom:0;
          padding:10px;
          background:linear-gradient(transparent,rgba(0,0,0,.5));
          transition: .3s ease-out;   
          z-index:1;   
        }
        .progress{
          position:relative;
          bottom:15px;
          left:0;
          right:0;
          cursor:pointer;
        }
        .options{
          display:flex;
          align-items:center;
        }
        .epicon{
          color:var(--icons,rgba(255,255,255,0.6));
          padding:0 10px;
        }
        .epicon{
          font-size:18px;
          transition: .3s;
          cursor:pointer;
        }
        .epicon:hover{
          color:#fff;
        }
        .time{
          position:relative;
          top:-2px;
        }
        .time b{
          font-weight:normal;
        }
        .line{
          padding:0 1px;
          margin-bottom: -2px;
          cursor:pointer
        }
        .line i{
          width:4px;
          border-radius:4px;
          display: inline-block;
          background: var(--icons,rgba(255,255,255,0.6));
          height: 12px;
          transform:scaleX(0.7);
          transition: .3s;
        }
        .line:hover i{
          height:14px;
          background:var(--theme,#00a1d6);
        }
        .active i{
          background:var(--theme,#00a1d6);
        }
        .left{
          flex:1;
        }
        .right{
          flex:1;
          display:flex;
          align-items:center;
          justify-content: flex-end;
        }
        .bg,.current,.buffer{
          left:0;
          height:3px;
          position:absolute;
          top:0;
        }
        .bg{
          right:0;
          background:var(--progress,rgba(255,255,255,.3));
        }
        .current{
          background:var(--theme,#00a1d6);
        }
        .buffer{
          background:var(--buffer,rgba(255,255,255,.5));
        }
        .dot{
          position:absolute;
          border-radius: 50%;
          display: block;
          background:var(--theme,#00a1d6);
          height: 9px;
          width:9px;
          right:-5px;
          top:-3px;
          cursor:pointer;
          z-index:1;
        }
        .cycle{
          position:absolute;
          border-radius: 50%;
          display: block;
          background:var(--theme,#00a1d6);
          opacity:0.3;
          height: 15px;
          width:15px;
          right:-8px;
          top:-6px;
          cursor:pointer;
          z-index:1;
        }
        @keyframes loading{
          0%{
            transform: rotate(0deg);
          }
          100%{
            transform: rotate(360deg);
          }  
        }
        .playing{
          position: absolute;
          z-index: 1;
          top:0;
          left:0;
          right:0;
          bottom:0;
        }
        .loading {
          position: absolute;
          z-index: 1;
          top: 50%;
          left: 50%;
          margin:-20px 0 0 -20px;
          width: 40px;
          height: 40px;
          z-index:1;
          box-shadow: 2px 0px rgba(255,255,255,.6);
          border-radius: 50%;
          animation: loading 1s linear infinite;
        }
        .ep-video {
          position: absolute;
          bottom: 25px;
          right: 20px;
          font-size:40px;
          color:var(--icons,rgba(255,255,255,.6));
          z-index:1;
          cursor: pointer; 
          z-index: 1;
        }
      </style>
      <div class="eplayer">
        <video id="video" class="video" src="${this.src}"></video>
        <div class="mark loading"></div>
        <div class="controls" style="bottom:-50px">
          <div class="progress">
            <b class="bg"></b>
            <b class="buffer"></b>
            <div class="current" style="width:0">
              <div class="dot"></div>
              <div class="cycle"></div>
            </div>
          </div>
          <div class="options">
            <div class="left">
              <i class="epicon ep-play is-play"></i>
              <span class="time">
                <b class="now">00:00</b> / <b class="total">00:00</b>
              </span>
            </div>
            <div class="right">
              <i class="epicon ep-volume is-volume"></i>
              <span class="line"><i></i></span>
              <span class="line"><i></i></span>
              <span class="line"><i></i></span>
              <span class="line"><i></i></span>
              <span class="line"><i></i></span>
              <span class="line"><i></i></span>
              <span class="line"><i></i></span>
              <span class="line"><i></i></span>
              <span class="line"><i></i></span>
              <span class="line"><i></i></span>
              <i class="epicon ep-full"></i>
            </div>
          </div>
        </div>
        <div class="epicon ep-video"></div>
      </div>
    `
    let template = document.createElement('template')
    template.innerHTML = html
    this.attachShadow({
      mode: 'open'
    }).appendChild(template.content.cloneNode(true))
    this.dom()
  }

  dom() {
    this.video = this.$('video')
    this.video.volume = 0.5
    setVolume(this.video.volume * 10, this.$('.line'))
    this.$('.is-volume').onclick = () => this.volume()
    this.$('.line').forEach((item, index) => {
      item.onclick = () => {
        this.video.volume = index / 10
        setVolume(index + 1, this.$('.line'))
      }
    })
    this.$('.progress').onmousedown = e => this.progress(e)
    this.video.onwaiting = () => this.waiting()
    this.video.oncanplay = () => this.canplay()
    this.video.ontimeupdate = () => this.update()
    this.$('.cycle').onmousedown = e => this.down(e)

    this.$('.eplayer').onmousemove = () => this.alow()
    document.onkeydown = e => this.keydown(e)
    this.$('.ep-full').onclick = () => this.full()
    this.$('.ep-video').onclick = this.$('.is-play').onclick = () => this.play()
    this.video.onended = () => this.ended()
    this.$('.mark').ondblclick = () => {
      clearTimeout(this.timer)
      this.full()
    }
  }

  $(node) {
    let dom = this.shadowRoot.querySelectorAll(node)
    return dom.length > 1 ? dom : dom[0]
  }
}

customElements.define('e-player', Eplayer)

function getTimeStr(time) {
  let h = Math.floor(time / 3600)
  let m = Math.floor((time % 3600) / 60)
  let s = Math.floor(time % 60)
  h = h >= 10 ? h : '0' + h
  m = m >= 10 ? m : '0' + m
  s = s >= 10 ? s : '0' + s
  return h === '00' ? m + ':' + s : h + ':' + m + ':' + s
}

function setVolume(index, node) {
  for (let j = index; j < node.length; j++) {
    node[j].classList.remove('active')
  }
  for (let i = 0; i < index; i++) {
    node[i].classList.add('active')
  }
}

function isFullScreen() {
  return (
    document.isFullScreen ||
    document.webkitIsFullScreen ||
    document.mozIsFullScreen
  )
}
