(function () {
  "use strict";

  Theme.loading = {
    register: function () {
      const loadingWrappers = document.getElementsByClassName('loading-wrapper');
      for (let i = 0; i < loadingWrappers.length; i++) {
        loadingWrappers[i].removeAttribute('data-loading');
      }
      
      const pages = document.getElementsByClassName('page');
      for (let i = 0; i < pages.length; i++) {
        pages[i].removeAttribute('data-filter');
      }
    },

    // 检查所有资源是否加载完成
    checkAllResourcesLoaded: function() {
      // 检查图片是否加载完成
      const images = document.querySelectorAll('img');
      let imagesLoaded = 0;
      const totalImages = images.length;

      if (totalImages === 0) {
        this.register();
        return;
      }

      images.forEach(img => {
        if (img.complete) {
          imagesLoaded++;
        } else {
          img.addEventListener('load', () => {
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
              this.register();
            }
          });
          img.addEventListener('error', () => {
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
              this.register();
            }
          });
        }
      });

      if (imagesLoaded === totalImages) {
        this.register();
      }
    }
  };

  // 页面加载完成后隐藏加载动画
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // 检查字体是否加载完成
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          setTimeout(() => {
            Theme.loading.checkAllResourcesLoaded();
          }, 100);
        });
      } else {
        // 如果不支持Font Loading API，延迟更长时间
        setTimeout(() => {
          Theme.loading.checkAllResourcesLoaded();
        }, 500);
      }
    });
  } else {
    // 如果DOM已经加载完成
    Theme.loading.checkAllResourcesLoaded();
  }

  // 监听页面完全加载完成（包括所有资源）
  window.addEventListener('load', function() {
    // 确保加载动画被移除
    setTimeout(() => {
      Theme.loading.register();
    }, 50);
  });

  // 超时保护，最多3秒后强制隐藏加载动画
  setTimeout(() => {
    Theme.loading.register();
  }, 3000);

}.call(this));
