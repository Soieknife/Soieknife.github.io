/**
 * 图片懒加载功能
 * 使用 Intersection Observer API 实现高性能图片懒加载
 */
(function() {
  'use strict';

  /**
   * 初始化图片懒加载
   */
  function initLazyLoad() {
    // 检查浏览器是否支持 Intersection Observer
    if (!('IntersectionObserver' in window)) {
      // 不支持则直接加载所有图片
      loadAllImages();
      return;
    }

    // 创建 Intersection Observer 实例
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          loadImage(img);
          observer.unobserve(img);
        }
      });
    }, {
      // 提前50px开始加载
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    // 观察所有需要懒加载的图片
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  }

  /**
   * 加载单张图片
   * @param {HTMLImageElement} img - 图片元素
   */
  function loadImage(img) {
    const src = img.getAttribute('data-src');
    if (!src) return;

    // 创建新的图片对象预加载
    const imageLoader = new Image();
    
    imageLoader.onload = function() {
      // 加载成功后替换src
      img.src = src;
      img.removeAttribute('data-src');
      img.classList.add('loaded');
      
      // 添加淡入效果
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease-in-out';
      setTimeout(() => {
        img.style.opacity = '1';
      }, 10);
    };

    imageLoader.onerror = function() {
      // 加载失败时显示占位图
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD48L3N2Zz4=';
      img.removeAttribute('data-src');
      img.classList.add('error');
    };

    // 开始加载图片
    imageLoader.src = src;
  }

  /**
   * 降级方案：直接加载所有图片
   */
  function loadAllImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(loadImage);
  }

  /**
   * 为现有图片添加懒加载属性
   */
  function convertImagesToLazy() {
    const images = document.querySelectorAll('img:not([data-src])');
    images.forEach(img => {
      if (img.src && !img.src.startsWith('data:')) {
        img.setAttribute('data-src', img.src);
        // 设置占位图
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2NjYyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWKoOi9veS4rS4uLjwvdGV4dD48L3N2Zz4=';
        img.style.backgroundColor = '#f5f5f5';
      }
    });
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      convertImagesToLazy();
      initLazyLoad();
    });
  } else {
    convertImagesToLazy();
    initLazyLoad();
  }

  // 导出到全局作用域，供其他脚本使用
  window.LazyLoad = {
    init: initLazyLoad,
    loadImage: loadImage,
    convertImagesToLazy: convertImagesToLazy
  };
})();