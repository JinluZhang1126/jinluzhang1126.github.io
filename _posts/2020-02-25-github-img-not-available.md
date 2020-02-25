---
title: 问题解决：Github图片无法访问
tags: enviroment-setup, bug
layout: article
aside:
  toc: true
key: 2020-02-25-github-img-not-available
show_title: true
---


## 需求

最近发现在墙内无法顺畅的访问github远程仓库中的图片，导致自己的博客中的图片全都裂开了。。。
<!--more-->
之前的访问方式：

1. 找到github远程库中的图片，复制图片链接，格式一般是这样的：`https://raw.githubusercontent.com/username/repo_name/img_name...`， 
2. 在markdown文档中嵌入图片链接

现在的情况是这样的:cry:：![image-20200225115717536](https://jinluzhang.site/PublicPic/Pic/image-20200225115717536.png)

## 原因分析

github的服务器是在国外的，对于一些文字代码信息还可以预览编辑，但是图片却无法在线访问，如果切换到外网是可以访问的非常丝滑的，那么基本就是防火墙的问题了。但是博客对其他访问者是开放的，总不能让所有人都去翻翻翻。。。

## 解决方案

经过上下求索，找到了一个可靠长久的解决方法，特别是针对那些有写博客需求的人。

我们需要给网站配置一个分流配置，具体原理不赘述，我的理解也不深，大致就是加了一个分流中转，让访问`https://raw.githubusercontent.com/username/repo_name/img_name...`这个地址的人先访问国内的域名，然后通过DNS转到这个真实的地址

1. 建立一个GitHub图片库，注意要设置为共有，以后图片都放到这里面

<img src="https://jinluzhang.site/PublicPic/Pic/image-20200225121128297.png" alt="image-20200225121128297" style="zoom:50%;" />

2. 开启github pages功能，branch选中 master 就行

   <img src="https://jinluzhang.site/PublicPic/Pic/image-20200225133214494.png" alt="image-20200225133214494" style="zoom: 67%;" />

3. 图中因为我配了一个域名，所以直接显示了域名，如果没有自己的域名就是github.io
4. 直接访问域名+图片路径，以http://jinluzhang.site/PublicPic/Pic/image-20200225121128297.png为例，就会显示了，在markdown嵌入即可。