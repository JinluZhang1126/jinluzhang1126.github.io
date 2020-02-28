---
title: Jekyll+云服务器搭建
layout: article
aside:
  toc: true
key: 2020-02-28-Jekyll-blog
show_title: true
---

*博客参考自：*

https://cloud.tencent.com/developer/article/1453573， https://segmentfault.com/a/1190000012560959

## 需求

最近因为一些原因需要在自己租的云服务器上搭建Jekyll博客，由于之前都是在GitHub Pages上搭建的，其实在服务器这一块只需要`git push`上去就行了，现在多了一步如何在服务器上启动jekyll，因为看不少教程都没有说清楚这一步，所以写个博客记录一下，顺便梳理一下自己搭建博客的历程。

下面以Jekyll模板+阿里云轻量服务器CentOS7.3为例，进行说明
<!--more-->
## Jekyll+Github Pages

1. 需要了解一下Jekyll的基础知识：http://jekyllcn.com/docs/home/

2. 然后需要建立一个你的仓库，命名为username.github.io即可，然后开启Github Pages功能，如图：

<img src="https://jinluzhang.site/PublicPic/Pic/image-20200225144538660.png" alt="img-github-page" style="zoom: 67%;" />

3. 选一个喜欢的Jekyll模板，GitHub提供了几个，点击`Change theme`即可看到，觉得不喜欢还可以自己去找：http://jekyllthemes.org/， 选中之后去他的github仓库，`git clone`下来，放进自己刚才创建的仓库，第一次搭建建议找一个README文档说明详细的，方便修改博客的各种属性，我选择的是[Text Theme](https://github.com/kitian616/jekyll-TeXt-theme)
4. 本地调试需要搭建一个Ruby+bundle+jekyll的环境，参考http://jekyllcn.com/docs/installation/，对于ubuntu/centos用户，使用apt/yum等包管理安装的ruby版本可能不对，参考这里安装rubyhttps://segmentfault.com/a/1190000012560959
5. 配置好之后，在博客文件夹下使用`bundle exec jekyll serve`即可在本地浏览器调试、预览。
6. 先读模板的代码，对应修改一些属性，这是我修改之后的模板[Jinlu Zhang](https://github.com/JinluZhang1126/jinluzhang1126.github.io/tree/template)，对一些不明确的属性加了注释，然后还对模板根据喜好做了些修改，`git clone`我这个也可以。
7. 最终把自己满意的版本push到github仓库，他就可以自己部署了。

## 云服务器部署

### 环境搭建

在云服务器上部署其实和本地调试区别不大，主要在于ruby版本和后续安装要正确，安装姿势也要对，**切记不要直接`sudo yum install ruby`,安装版本可能太老**

- （**推荐**）rvm安装

- 源码编译：https://www.ruby-lang.org/en/documentation/installation/#building-from-source

以使用rvm配置为例：

1. 安装rvm

   ```bash
   gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
   curl -sSL https://get.rvm.io | bash -s stable
   
   # 如果上面的连接失败，可以尝试: 
   curl -L https://raw.githubusercontent.com/wayneeseguin/rvm/master/binscripts/rvm-installer | bash -s stable
   ```

   可能会问你 `sudo` 管理员密码，以及自动通过 `Homebrew` 安装依赖包，等待一段时间后就可以成功安装好 `RVM`。

   然后，载入 `RVM` 环境（新开 `Termal` 就不用这么做了，会自动重新载入的）

   ```bash
   source /usr/local/rvm/scripts/rvm
   ```

   修改 RVM 的 Ruby 安装源到 Ruby China 的 Ruby 镜像服务器，这样能提高安装速度

   ```bash
   echo "ruby_url=https://cache.ruby-china.org/pub/ruby" >> /usr/local/rvm/user/db
   ```

   

   检查一下是否安装正确

   ```bash
   rvm -v
   
   rvm 1.29.3 (latest) by Michal Papis, Piotr Kuczynski, Wayne E. Seguin [https://rvm.io]
   ```

2. 使用rvm安装ruby

   ```bash
   rvm requirements
   rvm install 2.7.0
   ```

   设置 Ruby 版本,同样，也可以用其他版本号，前提是你有用 rvm install 安装过那个版本

   ```bash
   rvm use 2.7.0 --default
   ```

   测试

   ```bash
   ruby -v
   ruby 2.3.0p0 (2015-12-25 revision 53290) [x86_64-linux]
   
   gem -v
   2.5.1
   ```

3. 安装bundler

   ```bash
   gem install bundler
   ```

4. 转到服务器上存放博客的路径下，启动jekyll服务

   ```javascript
   jekyll serve -H 0.0.0.0 -P 80
   ```

   这样启动的服务在你关闭命令行后就会停止，而我们在服务器的服务不可能保存命令行连接，因此需要修改为：

   ```bash
   jekyll serve -H 0.0.0.0 -P 80 --detach
   ```

   当你想要停止服务时，可以使用以下命令：

   ```javascript
   pkill -f jekyll
   ```

   或者

   ```bash
   ps -ef | grep jekyll
   
   kill -9 jekyll服务进程编号
   ```

### nginx端口分发

服务器上不可能只运行一个博客，但是80端口只有一个

在启动Jekyll服务时，使用的命令：

```javascript
jekyll serve -H 0.0.0.0 -P 80 --detach
```

其中-P指定的就是启动时的端口，你可以修改为任意你服务器开放了的端口，如：

```javascript
jekyll serve -H 0.0.0.0 -P 8899 --detach
```

这样，你就将Jekyll服务启动在了8899端口下，那么问题来了，刚才说的只能访问80端口呢！不急。

我们在购买域名后，可以设置子域名。

1.首先去域名购买网站的控制台，在解析记录中，添加你想使用的子域名,同样解析指向你的服务器，如：

```javascript
blog.yuming.com
```

2.在服务器上安装nginx。

```javascript
$sudo apt-get install nginx
```

3.启动nginx

```javascript
$sudo /etc/init.d/nginx start
```

4.修改nginx配置文件

```javascript
cd /etc/nginx
vi nginx.conf
```

在 http 后的大括号内添加图片内容： 

![image-20200228103323218](https://jinluzhang.site/PublicPic/Pic/image-20200228103323218.png)

其中

liston：80。想要监听的端口 server_name:blog.yuming.com。为你设置的子域名 location 后面的 http://localhost:8899。为你启动的Jekyll端口。

5.重新nginx

```javascript
service nginx restart
```

然后在浏览器访问你的子域名即可跳转至你的博客。