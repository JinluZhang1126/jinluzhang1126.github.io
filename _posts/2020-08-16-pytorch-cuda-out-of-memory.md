---
title: Pytorch显存充足出现CUDA error:out of memory错误
tags: bug
layout: article
aside:
  toc: true
key: 2020-08-16-pytorch-cuda-out-of-memory
show_title: true
---
<!--more-->

# Pytorch显存充足出现CUDA error:out of memory错误

> Ref:
> [https://www.cnblogs.com/jisongxie/p/10276742.html](https://www.cnblogs.com/jisongxie/p/10276742.html)

<a name="RHzfn"></a>
## 报错内容
![image.png](https://cdn.nlark.com/yuque/0/2020/png/602350/1597653487139-4497bfd2-30ab-4733-86d9-64e769a2f690.png#align=left&display=inline&height=31&margin=%5Bobject%20Object%5D&name=image.png&originHeight=31&originWidth=414&size=9563&status=done&style=none&width=414)
<a name="cHujo"></a>
## Bug描述
显存充足，并且已经通过 `torch.nn.DataParallel` 指定GPU编号<br />CUDA与CUDNN均无错误，NVIDIA驱动无错误
<a name="VwWaK"></a>
## 解决方案
以上情况很可能是是Tensorflow和pytorch冲突导致的，因为我发现当我同学在0号GPU上运行程序我就会出问题。<br />详见pytorch官方论坛：<br />[https://discuss.pytorch.org/t/gpu-is-not-utilized-while-occur-runtimeerror-cuda-runtime-error-out-of-memory-at/34780](https://discuss.pytorch.org/t/gpu-is-not-utilized-while-occur-runtimeerror-cuda-runtime-error-out-of-memory-at/34780)<br />![](https://cdn.nlark.com/yuque/0/2020/png/602350/1597653932033-c9117000-4d24-4cc9-ab6d-35712afbacdb.png#align=left&display=inline&height=283&margin=%5Bobject%20Object%5D&originHeight=283&originWidth=756&size=0&status=done&style=none&width=756)<br />使用 `CUDA_VISIBLE_DEVICES` 限制一下使用的GPU。<br />比如有0,1,2,3号GPU，CUDA_VISIBLE_DEVICES=2,3，则当前进程的可见GPU只有物理上的2、3号GPU，此时它们的编号也对应变成了0、1，即cuda:0对应2号GPU，cuda:1对应3号GPU。
```python
# 使用python的os模块

import os
os.environ['CUDA_VISIBLE_DEVICES']='2, 3'
```


```bash
# 直接设置环境变量(linux系统)

export CUDA_VISIBLE_DEVICES=2,3
```
