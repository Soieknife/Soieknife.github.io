/**
 * 自定义音乐播放器
 * 集成网易云音乐API，提供完整的播放器功能
 */
class CustomMusicPlayer {
  constructor() {
    // API配置
    this.apiBase = 'https://api.vkeys.cn/v2/music/netease';
    
    // 播放器元素
    this.audioPlayer = document.getElementById('audio-player');
    this.playBtn = document.querySelector('.btn-play');
    this.prevBtn = document.querySelector('.btn-prev');
    this.nextBtn = document.querySelector('.btn-next');
    this.volumeBtn = document.querySelector('.btn-volume');
    this.volumeRange = document.querySelector('.volume-range');
    this.progressBar = document.querySelector('.progress-bar');
    this.progressFill = document.querySelector('.progress-fill');
    this.currentTimeEl = document.querySelector('.current-time');
    this.totalTimeEl = document.querySelector('.total-time');
    
    // 歌曲信息元素
    this.currentCover = document.getElementById('current-cover');
    this.currentTitle = document.querySelector('.current-song-title');
    this.currentArtist = document.querySelector('.current-song-artist');
    this.lyricsContent = document.querySelector('.lyrics-content');
    
    // 播放列表
    this.playlist = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isMuted = false;
    this.currentLyrics = [];
    this.currentLyricIndex = 0;
    
    this.init();
  }

  /**
   * 初始化播放器
   */
  async init() {
    // 显示加载动画
    this.showLoading();
    
    try {
      console.log('开始初始化音乐播放器...');
      
      // 加载播放列表
      await this.loadPlaylist();
      
      // 绑定事件
      this.bindEvents();
      this.setupAudioEvents();
      
      // 加载当前歌曲的所有信息（音频URL、歌词、封面等）
      await this.loadCurrentSong();
      
      console.log('自定义音乐播放器初始化完成');
      
    } catch (error) {
      console.error('音乐播放器初始化失败:', error);
      this.showError('播放器初始化失败，请刷新页面重试');
    } finally {
      // 确保所有内容加载完成后才隐藏加载动画
      this.hideLoading();
    }
  }

  /**
   * 加载播放列表
   */
  async loadPlaylist() {
    const songItems = document.querySelectorAll('.song-item');
    this.playlist = Array.from(songItems).map((item, index) => ({
      id: item.dataset.songId,
      neteaseId: item.dataset.neteaseId,
      title: item.querySelector('.song-title').textContent,
      artist: item.querySelector('.song-artist').textContent,
      duration: item.querySelector('.song-duration').textContent,
      element: item
    }));
    
    // 设置当前播放的歌曲
    const activeItem = document.querySelector('.song-item.active');
    if (activeItem) {
      this.currentIndex = this.playlist.findIndex(song => song.element === activeItem);
    }
    
    // 自动获取歌曲信息
    await this.fetchSongDetails();
  }

  /**
   * 获取歌曲详细信息
   */
  async fetchSongDetails() {
    console.log('开始获取歌曲详细信息...');
    
    for (let i = 0; i < this.playlist.length; i++) {
      const song = this.playlist[i];
      
      try {
        console.log(`正在获取歌曲 ${song.neteaseId} 的信息...`);
        
        // 使用正确的API格式
        const response = await fetch(`${this.apiBase}?id=${song.neteaseId}&quality=9`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`API响应:`, data);
          
          if (data.code === 200 && data.data) {
            const songInfo = data.data;
            
            // 更新播放列表中的信息
            song.title = songInfo.song || `歌曲 ${song.neteaseId}`;
            song.artist = songInfo.singer || '未知歌手';
            song.duration = songInfo.interval || '--:--';
            song.cover = songInfo.cover || '/img/default-album.svg';
            song.musicUrl = songInfo.url; // 保存音乐播放链接
            song.album = songInfo.album || '';
            song.quality = songInfo.quality || '';
            
            // 更新DOM显示
            this.updateSongDisplay(song);
            console.log(`✅ 成功获取歌曲信息: ${song.title} - ${song.artist} (${song.quality})`);
          } else {
            // API返回失败，使用默认信息
            this.setDefaultSongInfo(song);
            console.log(`❌ API返回失败，使用默认信息: 歌曲 ${song.neteaseId}`);
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
      } catch (error) {
        console.error(`❌ 获取歌曲 ${song.neteaseId} 信息失败:`, error);
        // 设置默认信息
        this.setDefaultSongInfo(song);
      }
      
      // 添加延迟避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('🎵 歌曲信息获取完成');
  }

  /**
   * 设置默认歌曲信息
   */
  setDefaultSongInfo(song) {
    song.title = `歌曲 ${song.neteaseId}`;
    song.artist = '未知歌手';
    song.duration = '--:--';
    song.cover = '/img/default-album.svg';
    song.musicUrl = null;
    
    // 更新DOM显示
    this.updateSongDisplay(song);
  }

  /**
   * 更新歌曲显示
   */
  updateSongDisplay(song) {
    const titleEl = song.element.querySelector('.song-title');
    const artistEl = song.element.querySelector('.song-artist');
    const durationEl = song.element.querySelector('.song-duration');
    const coverEl = song.element.querySelector('.song-cover-img');
    
    if (titleEl) titleEl.textContent = song.title;
    if (artistEl) artistEl.textContent = song.artist;
    if (durationEl) durationEl.textContent = song.duration;
    
    // 更新播放列表中的封面
    if (coverEl) {
      if (song.cover && song.cover !== '') {
        coverEl.src = song.cover;
        console.log(`🖼️ 更新播放列表封面: ${song.title} - ${song.cover}`);
      } else {
        coverEl.src = '/img/default-album.svg';
      }
      coverEl.alt = `${song.title} - ${song.artist}`;
      
      // 添加封面加载错误处理
      coverEl.onerror = () => {
        console.warn(`⚠️ 播放列表封面加载失败: ${song.cover}`);
        coverEl.src = '/img/default-album.svg';
      };
    }
  }

  /**
   * 设置默认歌曲信息
   */
  setDefaultSongInfo(song) {
    song.title = `歌曲 ${song.neteaseId}`;
    song.artist = '未知歌手';
    song.duration = '--:--';
    song.cover = '/img/default-album.svg';
    song.musicUrl = null;
    
    // 更新DOM显示
    this.updateSongDisplay(song);
  }



  /**
   * 格式化时长
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    // 播放控制按钮
    this.playBtn.addEventListener('click', () => this.togglePlay());
    this.prevBtn.addEventListener('click', () => this.playPrevious());
    this.nextBtn.addEventListener('click', () => this.playNext());
    
    // 音量控制
    this.volumeBtn.addEventListener('click', () => this.toggleMute());
    this.volumeRange.addEventListener('input', (e) => this.setVolume(e.target.value));
    
    // 进度条控制
    this.progressBar.addEventListener('click', (e) => this.seekTo(e));
    
    // 播放列表点击
    this.playlist.forEach((song, index) => {
      song.element.addEventListener('click', () => this.playSong(index));
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  /**
   * 设置音频事件监听器
   */
  setupAudioEvents() {
    this.audioPlayer.addEventListener('loadstart', () => this.showLoading());
    this.audioPlayer.addEventListener('canplay', () => this.hideLoading());
    this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
    this.audioPlayer.addEventListener('ended', () => this.playNext());
    this.audioPlayer.addEventListener('error', (e) => this.handleError(e));
  }

  /**
   * 加载当前歌曲 - 确保所有资源都加载完成
   */
  async loadCurrentSong() {
    const currentSong = this.playlist[this.currentIndex];
    if (!currentSong) return;

    try {
      console.log(`开始加载歌曲: ${currentSong.title}`);
      
      // 创建一个Promise数组来等待所有异步操作完成
      const loadingPromises = [];
      
      // 1. 更新UI显示
      this.updateSongInfo(currentSong);
      this.updateActiveItem();
      
      // 2. 加载音频URL
      let audioLoadPromise;
      if (currentSong.musicUrl) {
        this.audioPlayer.src = currentSong.musicUrl;
        console.log(`🎵 使用已获取的音乐链接: ${currentSong.title}`);
        audioLoadPromise = this.waitForAudioLoad();
      } else {
        // 如果没有音乐链接，尝试重新获取
        audioLoadPromise = this.getMusicUrl(currentSong.neteaseId).then(musicUrl => {
          if (musicUrl) {
            this.audioPlayer.src = musicUrl;
            currentSong.musicUrl = musicUrl; // 保存链接
            return this.waitForAudioLoad();
          } else {
            throw new Error('无法获取音乐播放链接');
          }
        });
      }
      loadingPromises.push(audioLoadPromise);
      
      // 3. 加载歌词
      const lyricsPromise = this.loadLyrics(currentSong.neteaseId);
      loadingPromises.push(lyricsPromise);
      
      // 4. 等待封面图片加载（如果有的话）
      if (currentSong.coverUrl && this.currentCover) {
        const imageLoadPromise = this.waitForImageLoad(this.currentCover, currentSong.coverUrl);
        loadingPromises.push(imageLoadPromise);
      }
      
      // 等待所有资源加载完成
      await Promise.allSettled(loadingPromises);
      console.log(`歌曲 ${currentSong.title} 所有资源加载完成`);
      
    } catch (error) {
      console.error('加载歌曲失败:', error);
      this.showError('加载歌曲失败，请稍后重试');
    }
  }

  /**
   * 等待音频元素加载完成
   */
  waitForAudioLoad() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('音频加载超时'));
      }, 10000); // 10秒超时

      const onLoad = () => {
        clearTimeout(timeout);
        this.audioPlayer.removeEventListener('loadedmetadata', onLoad);
        this.audioPlayer.removeEventListener('error', onError);
        resolve();
      };

      const onError = () => {
        clearTimeout(timeout);
        this.audioPlayer.removeEventListener('loadedmetadata', onLoad);
        this.audioPlayer.removeEventListener('error', onError);
        reject(new Error('音频加载失败'));
      };

      this.audioPlayer.addEventListener('loadedmetadata', onLoad);
      this.audioPlayer.addEventListener('error', onError);
    });
  }

  /**
   * 等待图片加载完成
   */
  waitForImageLoad(imgElement, src) {
    return new Promise((resolve, reject) => {
      if (!imgElement || !src) {
        resolve(); // 如果没有图片元素或源，直接resolve
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('图片加载超时'));
      }, 5000); // 5秒超时

      const onLoad = () => {
        clearTimeout(timeout);
        imgElement.removeEventListener('load', onLoad);
        imgElement.removeEventListener('error', onError);
        resolve();
      };

      const onError = () => {
        clearTimeout(timeout);
        imgElement.removeEventListener('load', onLoad);
        imgElement.removeEventListener('error', onError);
        resolve(); // 图片加载失败不影响整体加载，使用默认图片
      };

      // 如果图片已经加载完成
      if (imgElement.complete && imgElement.naturalWidth > 0) {
        clearTimeout(timeout);
        resolve();
        return;
      }

      imgElement.addEventListener('load', onLoad);
      imgElement.addEventListener('error', onError);
      imgElement.src = src;
    });
  }

  /**
   * 获取音乐播放链接
   */
  async getMusicUrl(neteaseId) {
    try {
      console.log(`🔗 正在获取音乐链接: ${neteaseId}`);
      const response = await fetch(`${this.apiBase}?id=${neteaseId}&quality=9`);
      const data = await response.json();
      
      if (data.code === 200 && data.data && data.data.url) {
        console.log(`✅ 成功获取音乐链接: ${data.data.song}`);
        return data.data.url;
      } else {
        console.warn(`⚠️ API返回错误: ${data.message || '未知错误'}`);
        throw new Error('无法获取音乐链接');
      }
    } catch (error) {
      console.error('获取音乐链接失败:', error);
      return null;
    }
  }

  /**
   * 加载歌词
   */
  async loadLyrics(neteaseId) {
    try {
      const response = await fetch(`${this.apiBase}/lyric?id=${neteaseId}`);
      const data = await response.json();
      
      if (data.code === 200 && data.data && data.data.lrc) {
        this.currentLyrics = this.parseLyrics(data.data.lrc);
        this.displayLyrics();
      } else {
        this.currentLyrics = [];
        this.displayNoLyrics();
      }
    } catch (error) {
      console.error('获取歌词失败:', error);
      this.displayNoLyrics();
    }
  }

  /**
   * 解析歌词
   */
  parseLyrics(lrcText) {
    const lines = lrcText.split('\n');
    const lyrics = [];
    
    lines.forEach(line => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const milliseconds = parseInt(match[3]);
        const time = minutes * 60 + seconds + milliseconds / 100;
        const text = match[4].trim();
        
        if (text) {
          lyrics.push({ time, text });
        }
      }
    });
    
    return lyrics.sort((a, b) => a.time - b.time);
  }

  /**
   * 显示歌词
   */
  displayLyrics() {
    if (this.currentLyrics.length === 0) {
      this.displayNoLyrics();
      return;
    }
    
    const lyricsHtml = this.currentLyrics.map((lyric, index) => 
      `<p class="lyric-line" data-time="${lyric.time}" data-index="${index}">${lyric.text}</p>`
    ).join('');
    
    this.lyricsContent.innerHTML = lyricsHtml;
  }

  /**
   * 显示无歌词提示
   */
  displayNoLyrics() {
    this.lyricsContent.innerHTML = '<p class="lyric-line">暂无歌词</p>';
  }

  /**
   * 更新歌曲信息显示
   */
  updateSongInfo(song) {
    this.currentTitle.textContent = song.title;
    this.currentArtist.textContent = song.artist;
    this.totalTimeEl.textContent = song.duration;
    
    // 更新封面图片
    if (song.cover && song.cover !== '') {
      this.currentCover.src = song.cover;
      console.log(`🖼️ 更新封面: ${song.cover}`);
    } else {
      this.currentCover.src = '/img/default-album.svg';
      console.log(`🖼️ 使用默认封面`);
    }
    this.currentCover.alt = `${song.title} - ${song.artist}`;
    
    // 添加封面加载错误处理
    this.currentCover.onerror = () => {
      console.warn(`⚠️ 封面加载失败，使用默认封面: ${song.cover}`);
      this.currentCover.src = '/img/default-album.svg';
    };
  }

  /**
   * 更新播放列表中的活跃项
   */
  updateActiveItem() {
    // 移除所有活跃状态
    this.playlist.forEach(song => song.element.classList.remove('active'));
    
    // 添加当前歌曲的活跃状态
    if (this.playlist[this.currentIndex]) {
      this.playlist[this.currentIndex].element.classList.add('active');
    }
  }

  /**
   * 播放/暂停切换
   */
  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * 播放
   */
  async play() {
    try {
      await this.audioPlayer.play();
      this.isPlaying = true;
      this.playBtn.querySelector('i').className = 'icon-pause';
      this.playBtn.title = '暂停';
    } catch (error) {
      console.error('播放失败:', error);
      this.showError('播放失败，请检查网络连接');
    }
  }

  /**
   * 暂停
   */
  pause() {
    this.audioPlayer.pause();
    this.isPlaying = false;
    this.playBtn.querySelector('i').className = 'icon-play';
    this.playBtn.title = '播放';
  }

  /**
   * 播放上一首
   */
  playPrevious() {
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.loadCurrentSong();
  }

  /**
   * 播放下一首
   */
  playNext() {
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    this.loadCurrentSong();
  }

  /**
   * 播放指定歌曲
   */
  playSong(index) {
    this.currentIndex = index;
    this.loadCurrentSong();
  }

  /**
   * 音量控制
   */
  setVolume(value) {
    this.audioPlayer.volume = value / 100;
    this.updateVolumeIcon(value);
  }

  /**
   * 静音切换
   */
  toggleMute() {
    if (this.isMuted) {
      this.audioPlayer.muted = false;
      this.isMuted = false;
      this.volumeRange.value = this.audioPlayer.volume * 100;
    } else {
      this.audioPlayer.muted = true;
      this.isMuted = true;
      this.volumeRange.value = 0;
    }
    this.updateVolumeIcon(this.volumeRange.value);
  }

  /**
   * 更新音量图标
   */
  updateVolumeIcon(value) {
    const icon = this.volumeBtn.querySelector('i');
    if (value == 0 || this.isMuted) {
      icon.textContent = '🔇';
    } else if (value < 50) {
      icon.textContent = '🔉';
    } else {
      icon.textContent = '🔊';
    }
  }

  /**
   * 进度条跳转
   */
  seekTo(event) {
    const rect = this.progressBar.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const newTime = percent * this.audioPlayer.duration;
    
    if (!isNaN(newTime)) {
      this.audioPlayer.currentTime = newTime;
    }
  }

  /**
   * 更新播放进度
   */
  updateProgress() {
    const currentTime = this.audioPlayer.currentTime;
    const duration = this.audioPlayer.duration;
    
    if (!isNaN(duration)) {
      // 更新进度条
      const percent = (currentTime / duration) * 100;
      this.progressFill.style.width = `${percent}%`;
      
      // 更新时间显示
      this.currentTimeEl.textContent = this.formatTime(currentTime);
      
      // 更新歌词高亮
      this.updateLyricsHighlight(currentTime);
    }
  }

  /**
   * 更新歌词高亮
   */
  updateLyricsHighlight(currentTime) {
    if (this.currentLyrics.length === 0) return;
    
    // 找到当前时间对应的歌词
    let currentIndex = -1;
    for (let i = 0; i < this.currentLyrics.length; i++) {
      if (currentTime >= this.currentLyrics[i].time) {
        currentIndex = i;
      } else {
        break;
      }
    }
    
    // 更新歌词高亮
    const lyricLines = this.lyricsContent.querySelectorAll('.lyric-line');
    lyricLines.forEach((line, index) => {
      line.classList.remove('active', 'highlight');
      if (index === currentIndex) {
        line.classList.add('active');
        // 在歌词容器内滚动到当前歌词，避免整个页面滚动
        this.scrollLyricIntoView(line);
      } else if (index === currentIndex + 1) {
        line.classList.add('highlight');
      }
    });
    
    this.currentLyricIndex = currentIndex;
  }

  /**
   * 在歌词容器内滚动到指定歌词行
   * 避免整个页面滚动，只在歌词容器内滚动
   */
  scrollLyricIntoView(lyricLine) {
    if (!lyricLine || !this.lyricsContent) return;
    
    const container = this.lyricsContent.parentElement; // .lyrics-container
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const lineRect = lyricLine.getBoundingClientRect();
    
    // 计算歌词行相对于容器的位置
    const lineTop = lineRect.top - containerRect.top + container.scrollTop;
    const containerHeight = container.clientHeight;
    const lineHeight = lineRect.height;
    
    // 计算目标滚动位置（让歌词行居中显示）
    const targetScrollTop = lineTop - (containerHeight / 2) + (lineHeight / 2);
    
    // 平滑滚动到目标位置
    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: 'smooth'
    });
  }

  /**
   * 格式化时间
   */
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * 键盘快捷键处理
   */
  handleKeyboard(event) {
    // 只在音乐页面处理快捷键
    if (!document.querySelector('.music-page')) return;
    
    switch (event.code) {
      case 'Space':
        event.preventDefault();
        this.togglePlay();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.playPrevious();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.playNext();
        break;
      case 'ArrowUp':
        event.preventDefault();
        const currentVolume = parseInt(this.volumeRange.value);
        this.setVolume(Math.min(100, currentVolume + 10));
        this.volumeRange.value = Math.min(100, currentVolume + 10);
        break;
      case 'ArrowDown':
        event.preventDefault();
        const currentVolumeDown = parseInt(this.volumeRange.value);
        this.setVolume(Math.max(0, currentVolumeDown - 10));
        this.volumeRange.value = Math.max(0, currentVolumeDown - 10);
        break;
    }
  }

  /**
   * 显示加载状态 - 使用主题默认加载动画
   */
  showLoading() {
    // 创建主题默认的加载动画容器
    if (!document.querySelector('.loading-wrapper')) {
      const loadingWrapper = document.createElement('div');
      loadingWrapper.className = 'loading-wrapper';
      loadingWrapper.setAttribute('data-loading', 'true');
      
      const loading = document.createElement('div');
      loading.className = 'loading';
      
      // 创建5个点状加载动画
      for (let i = 0; i < 5; i++) {
        const span = document.createElement('span');
        loading.appendChild(span);
      }
      
      loadingWrapper.appendChild(loading);
      document.body.appendChild(loadingWrapper);
    }
    
    // 显示加载动画
    const loadingWrapper = document.querySelector('.loading-wrapper');
    if (loadingWrapper) {
      loadingWrapper.setAttribute('data-loading', 'true');
      loadingWrapper.style.display = 'flex';
    }
  }

  /**
   * 隐藏加载状态
   */
  hideLoading() {
    const loadingWrapper = document.querySelector('.loading-wrapper');
    if (loadingWrapper) {
      loadingWrapper.removeAttribute('data-loading');
      loadingWrapper.style.display = 'none';
    }
  }

  /**
   * 显示错误信息
   */
  showError(message) {
    console.error(message);
    // 可以在这里添加用户友好的错误提示
    this.lyricsContent.innerHTML = `<p class="lyric-line" style="color: #ff6b6b;">${message}</p>`;
  }

  /**
   * 处理音频错误
   */
  handleError(event) {
    console.error('音频播放错误:', event);
    this.showError('音频加载失败，请稍后重试');
    this.hideLoading();
  }
}

// 页面加载完成后初始化播放器
document.addEventListener('DOMContentLoaded', async () => {
  // 检查是否在音乐页面
  if (document.querySelector('.music-page')) {
    window.customMusicPlayer = new CustomMusicPlayer();
  }
});