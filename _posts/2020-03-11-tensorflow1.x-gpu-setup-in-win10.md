---
title: WIN10【Tensorflow-gpu+Anaconda3+cuda9.0+cudnn7.1】安装记录!
layout: article
aside:
  toc: true
key: 2020-03-11-tensorflow1.x-gpu-setup-in-win10
show_title: true
tags: configuration
---


首先，版本问题一定要适配https://www.tensorflow.org/install/source_windows，我装的是tensorflow-gpu1.11.0，配套是
<!--more-->
![](https://jinluzhang.site/PublicPic/Pic/clip_image001-1575469940025.png)

 

 **CUDA**和**CuDNN**

CUDA是NVIDIA推出的运算平台，CuDNN是专门针对Deep Learning框架设计的一套GPU计算加速方案。在安装之前要查询下最新TensorFLow发行版支持到了哪个版本。

1）显卡型号支持：https://developer.nvidia.com/cuda-gpus

 

 

![img](https://jinluzhang.site/PublicPic/Pic/clip_image002-1575469940025.png)

 

 

 

2）CUDA下载地址：https://developer.nvidia.com/cuda-toolkit-archive

 

![img](https://jinluzhang.site/PublicPic/Pic/clip_image003-1575469940026.png)

 

 

 

3）CuDNN下载地址：https://developer.nvidia.com/rdp/cudnn-download

 

（下载CuDNN需要注册账号，注册过程比较简单）

![img](https://jinluzhang.site/PublicPic/Pic/clip_image004-1575469940026.png)

 

TensorFlow

TensorFlow的版本信息可以在Github，tensorflow中文社区以及pypi上查看。

 

  Github：https://github.com/tensorflow/tensorflow/releases

 

  tensorflow社区：https://tensorflow.google.cn/versions/

 

  pypi：https://pypi.org/project/tensorflow/#history

 

TensorFlow可以直接在Anaconda Prompt的命令行中用指令：“conda install tensorflow-gpu”直接安装，并且该指令在安装TensorFlow时还会顺带把Cuda和CuDNN也给装了。考虑到conda 的软件包并没有官方支持，并且tensorflow和附带的Cuda和CuDNN版本都不是最新的，笔者未使用conda安装，而是使用原生的 pip 安装，安装过程见后文。

 

## **第一步：安装Anaconda**

**1.****下载和安装**

下载地址：https://www.anaconda.com/download/

![img](https://jinluzhang.site/PublicPic/Pic/clip_image005-1575469940026.png)

我系统是64位，所以下载 [64-Bit Graphical Installer (631 MB)](https://repo.anaconda.com/archive/Anaconda3-5.2.0-Windows-x86_64.exe)，之后就是进行安装了。

![img](https://jinluzhang.site/PublicPic/Pic/clip_image006-1575469940026.png)

和安装其他软件没有什么区别，需要注意的是这一步，不要勾选**“Add Anaconda to my PATH enviroment variable”，我们后面会手动加入。

![img](https://jinluzhang.site/PublicPic/Pic/clip_image007-1575469940026.png)

接下来就是等待了，安装结束后需要测试是否能正常使用，打开CMD输入“conda”命令，发现提示“'conda' is not recognized as an internal or external command, operable program or batch file.”

![img](https://jinluzhang.site/PublicPic/Pic/clip_image008-1575469940026.png)

这是由于我们没有配置环境变量的原因。

**2.****配置****Anaconda****环境变量**

我们点击左下角搜索栏搜索“环境变量”

![img](https://jinluzhang.site/PublicPic/Pic/clip_image009-1575469940026.png)

点击环境变量

![img](https://jinluzhang.site/PublicPic/Pic/clip_image010.png)

选择“Path”，点击“编辑”

![img](https://jinluzhang.site/PublicPic/Pic/clip_image011.png)

将以下三个路径加入，注意这里要换成你自己的安装路径。

- **G:\Anaconda\Anoconda3**
- **G:\Anaconda\Anoconda3\Scripts**
- **G:\Anaconda\Anoconda3\Library\bin**
- **G:\Anaconda\Anoconda3\Library\mingw-w64\bin**

![G:\Anaconda\Anoconda3\Scripts ](https://jinluzhang.site/PublicPic/Pic/clip_image012.png)

然后点击“确定”保存，这回再测试一下，再cmd中输入“conda -V”，能正常显示版本号，证明已经配置好了。

![img](https://jinluzhang.site/PublicPic/Pic/clip_image013.png)

 

来自 <[https://www.cnblogs.com/guoyaohua/p/9265268.html#%E7%AC%AC%E4%B8%80%E6%AD%A5%E5%AE%89%E8%A3%85anaconda](https://www.cnblogs.com/guoyaohua/p/9265268.html#第一步安装anaconda)> 

 

 

## **第二步：安装****TensorFlow-GPU**

打开tensorflow官网：https://www.tensorflow.org/install/install_windows#installing_with_anaconda

![img](https://jinluzhang.site/PublicPic/Pic/clip_image014.png)

跟着操作步骤走就可以了。

### **1.创建conda环境**

通过调用下列命令，创建一个名为tfgpu的Conda环境：

conda create -n tfgpu pip python=3.6

![img](https://jinluzhang.site/PublicPic/Pic/clip_image015.png)

等待相应包的安装，如果国内网络太慢的话，可以为conda设置清华源，这样速度能快一点，具体配置过程，网上查一下吧，此处不再讲述。如果看到这样的提示，就证明conda环境创建成功。

![img](https://jinluzhang.site/PublicPic/Pic/clip_image016.png)

### **2.**激活环境

**通过以下命令激活****conda****环境：**

activate tensorflow

![img](https://jinluzhang.site/PublicPic/Pic/clip_image017.png)

这样就进入了刚创建的“tensorflow”环境。

### **3.**安装tensorflow-gpu

安装GPU版本的tensorflow需要输入以下命令：

pip install --ignore-installed --upgrade tensorflow-gpu 

如果只需要安装CPU版本的tensorflow则输入以下命令：

pip install --ignore-installed --upgrade tensorflow

![img](https://jinluzhang.site/PublicPic/Pic/clip_image018.png)

这样就安装成功了。

注意：务必注意一点，在安装完**tensroflow后，由于我们是新创建的conda环境，该环境中基本上是空的，有很多包和IDE并没有安装进来，例如“Ipython”，“spyder”此时如果我们在该环境下打开spyder/Ipyton/jupyter notebook等，会发现其实IDE使用的kernel并不是新建立的这个环境的kernel，而是“base”这个环境的，而“base”环境中我们并没有安装tensorflow，所以一定无法import。这也就是为什么有很多人在安装好tensorflow后仍然在IDE里无法正常使用的原因了。****

**通过以下命令安装**Anaconda基础包

conda install anaconda

这回，我们测试一下是否能import tensorflow

![img](https://jinluzhang.site/PublicPic/Pic/clip_image019.png)

程序报错，这是由于我们虽然安装好了tensorflow-gpu，但是还需要安装CUDA Toolkit 和 cuDNN。

 

 

## **第三步：安装**CUDA Toolkit + cuDNN

### **1.**查看需要安装的CUDA+cuDNN版本

注意，tensorflow是在持续更新的，具体安装的CUDA和cuDNN版本需要去官网查看，要与最新版本的tensorflow匹配。

点击查看最新tensorflow支持的CUDA版本：https://www.tensorflow.org/install/install_windows#requirements_to_run_tensorflow_with_gpu_support

![img](https://jinluzhang.site/PublicPic/Pic/clip_image020.png)

现在（PS：此博客书写日期 2018年7月5日）最新版tensorflow支持的是 CUDA® Toolkit 9.0 + cuDNN v7.0，一定注意，安装的版本一定一定要正确，不要看NVIDIA官网推出CUDA® Toolkit 9.2了就感觉最新版的更好，而安装最新版，这样很可能会导致tensorflow无法正常使用，所以一定要跟着tensorflow 官网的提示来。

### **2.**下载CUDA + cuDNN

在这个网址查找CUDA已发布版本：https://developer.nvidia.com/cuda-toolkit-archive

![img](https://jinluzhang.site/PublicPic/Pic/clip_image021.png)

进入下载界面

![img](https://jinluzhang.site/PublicPic/Pic/clip_image022.png)

下载好CUDA Toolkit 9.0 后，我们开始下载cuDnn 7.0，需要注意的是，下载cuDNN需要在nvidia上注册账号，使用邮箱注册就可以，免费的。登陆账号后才能下载。

cuDNN历史版本在该网址下载：https://developer.nvidia.com/rdp/cudnn-archive

![img](https://jinluzhang.site/PublicPic/Pic/clip_image023.png)

 

![img](https://jinluzhang.site/PublicPic/Pic/clip_image024.png)

这样，我们就下载好了 CUDA Toolkit 9.0 和 cuDnn 7.0，下面我们开始安装。

![img](https://jinluzhang.site/PublicPic/Pic/clip_image025.png)

### **3.**安装 CUDA Toolkit 9.0 和 cuDnn 7.0

**至关重要的一步：卸载显卡驱动**

由于CUDA Toolkit需要在指定版本显卡驱动环境下才能正常使用的，所以如果我们已经安装了nvidia显卡驱动（很显然，大部分人都安装了），再安装CUDA Toolkit时，会因二者版本不兼容而导致CUDA无法正常使用，这也就是很多人安装失败的原因。而CUDA Toolkit安装包中自带与之匹配的显卡驱动，所以务必要删除电脑先前的显卡驱动。

**安装**

![img](https://jinluzhang.site/PublicPic/Pic/clip_image026.png)

 

![img](https://jinluzhang.site/PublicPic/Pic/clip_image027.png)

此处选择“自定义（高级）”

![img](https://jinluzhang.site/PublicPic/Pic/clip_image028.png)

勾选所有

![img](https://jinluzhang.site/PublicPic/Pic/clip_image029.png)

一路通过即可。

接下来，解压“cudnn-9.0-windows10-x64-v7.zip”，将一下三个文件夹，拷贝到CUDA安装的根目录下。

![img](https://jinluzhang.site/PublicPic/Pic/clip_image030.png)

这样CUDA Toolkit 9.0 和 cuDnn 7.0就已经安装了，下面要进行环境变量的配置。

**配置环境变量**

将下面四个路径加入到环境变量中，注意要换成自己的安装路径。(此处最好放到anaconda环境变量下面)

C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v9.0\bin

C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v9.0\libnvvp

C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v9.0

C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v9.0\lib\x64

到此，全部的安装步骤都已经完成，这回我们测试一下。

安装完成后，打开cmd窗口，输入nvcc -V，查看CUDA是否正确安装。若正确安装，会出来下图：

![da compl ler driver  nvcc :  Copyright (https://jinluzhang.site/PublicPic/Pic/clip_image031.png) 2005—2017 WIDIA Corporation  Built on Fri_Sep_1 21:08:32_Centra1_Day1ight_Time_2017  Cuda compi lation tools, release 9. 0, V9. 0. 176 ](file:///C:/Users/KIMZHA~1/AppData/Local/Temp/msohtmlclip1/01/clip_image031.png)

**第四步：测试**

1.查看是否使用GPU

```
import tensorflow as tf
tf.test.gpu_device_name()
```



![img](https://jinluzhang.site/PublicPic/Pic/clip_image032.png)

2.查看在使用哪个GPU

```
from tensorflow.python.client import device_lib
device_lib.list_local_devices()
```

![img](https://jinluzhang.site/PublicPic/Pic/clip_image033.png)

好了大功告成！

 

https://www.cnblogs.com/guoyaohua/p/9265268.html