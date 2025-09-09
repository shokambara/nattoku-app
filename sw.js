const CACHE_NAME = 'nattoku-gai-cache-v1';
// オフラインでも動作するためにキャッシュするファイルのリスト
const urlsToCache = [
  '/',
  'index.html',
  '192x192.png',
  'manifest.json'
];

// サービスワーカーのインストール時に実行されるイベント
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // 指定されたファイルをすべてキャッシュに追加する
        return cache.addAll(urlsToCache);
      })
  );
});

// ネットワークリクエストが発生したときに実行されるイベント
self.addEventListener('fetch', event => {
  event.respondWith(
    // まずキャッシュ内にリクエストされたリソースがあるか確認する
    caches.match(event.request)
      .then(response => {
        // キャッシュにあれば、それを返す
        if (response) {
          return response;
        }
        // キャッシュになければ、ネットワークから取得して返す
        return fetch(event.request);
      })
  );
});

// プッシュ通知がクリックされたときに実行されるイベント
self.addEventListener('notificationclick', event => {
  console.log('On notification click: ', event.notification.tag);
  event.notification.close();

  // アプリのウィンドウが既に開いているか確認し、開いていればフォーカスする
  event.waitUntil(clients.matchAll({
    type: "window"
  }).then(clientList => {
    for (let i = 0; i < clientList.length; i++) {
      const client = clientList[i];
      if (client.url == '/' && 'focus' in client)
        return client.focus();
    }
    // ウィンドウが開いていなければ、新しく開く
    if (clients.openWindow)
      return clients.openWindow('/');
  }));
});
