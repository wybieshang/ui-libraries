export function Upload(options) {
  // 从全局获取请求库
  // eslint-disable-next-line no-underscore-dangle
  const createService = window._lcapCreateService;
  const {
    url,
  } = options;

  const service = createService({
    UploadFile: {
      url: {
        method: 'post',
        path: url,
      },
    },
  });

  const onUploadProgress = (e) => {
    if (e.total > 0) {
      e.percent = (e.loaded / e.total) * 100;
    }
    options.onProgress(e);
  };

  const body = new FormData();
  if (options.data) {
    Object.keys(options.data).forEach((key) => {
      body.append(key, options.data[key]);
    });
  }
  body.append(options.name, options.file.file);

  if (typeof options.onStart === 'function') {
    options.onStart();
  }

  return service.UploadFile({
    headers: options.headers || {},
    body,
    config: {
      withCredentials: options.withCredentials,
      onUploadProgress,
    },
  }).then((res) => {
    if (typeof options.onSuccess === 'function') options.onSuccess(res);
  }).catch((err) => {
    if (typeof options.onError === 'function') options.onError(err);
  });
}
