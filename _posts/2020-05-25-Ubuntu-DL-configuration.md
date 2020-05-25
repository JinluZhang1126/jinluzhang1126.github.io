---
title: Ubuntu18.04-DL环境配置-驱动+新建用户+conda+Tensorflow/Pytorch
tags: configuration
layout: article
aside:
  toc: true
key: 2020-05-25-Ubuntu-DL-configuration
show_title: true
show_excerpt: false
---


<a name="kT3br"></a>
# 1. 检查驱动
使用 nvidia-smi 查看驱动，若没有cuda驱动，查阅[博客](http://jinluzhang.site/2020/02/17/Ubuntu18.04-rebuild-Nvidia-driver-cuda-cudnn-multi-use-anaconda.html)<br />正常情况截图：<br />![image.png](https://cdn.nlark.com/yuque/0/2020/png/602350/1590373061878-75120abc-07c6-4abe-aa7e-76f8314d1737.png#align=left&display=inline&height=97&margin=%5Bobject%20Object%5D&name=image.png&originHeight=79&originWidth=574&size=37232&status=done&style=none&width=708)
<a name="Z0FWz"></a>
# 2. 新建用户（非必须）
新建只能在控制台下登录的用户<br />

1. 切换为root用户为了获取创建用户的权限<br />
peng@ubuntu:~$ sudo su
1. 添加一个新用户（如用户名为csdn）<br />
root@ubuntu:/home/peng# useradd zjl
1. 为该用户设定登录密码<br />
root@ubuntu:/home/peng# passwd zjl
1. 为该用户指定命令解释程序（通常为/bin/bash）<br />
root@ubuntu:/home/peng# usermod -s /bin/bash zjl
1. 为该用户指定用户主目录<br />
root@ubuntu:/home/peng# usermod -d /home/zjl zjl
1.  查看用户的属性<br />
root@ubuntu:/home/peng# cat /etc/passwd<br />
可以看到，已经存在csdn这个用户。/etc/passwd中一行记录对应着一个用户，每行记录又被冒号(:)分隔为7个字段，其格式和具体含义如下：<br />
用户名:口令:用户标识号:组标识号:注释性描述:用户主目录:命令解释程序
1. 切换到用户zjl<br />
root@ubuntu:/home/peng# su zjl<br />
切换后可以看到登陆以后的用户csdn当前所在目录仍为“/home/peng”，即用户peng的主目录。<br />
这种方式只能在控制台中互相切换用户，一旦重启系统，用该用户还是无法登陆（只能用原来的用户或root登陆）。



<a name="Jen1N"></a>
# 3. 安装conda
打开[https://docs.anaconda.com/anaconda/install/linux/](https://docs.anaconda.com/anaconda/install/linux/)<br />找到自己想下载的
```bash
wget https://repo.anaconda.com/archive/Anaconda3-2020.02-Linux-x86_64.sh
bash Anaconda3-2020.02-Linux-x86_64.sh
```
一路回车＋yes<br />最后指定一个安装路径 /mnt/data3/home/zjl/software/anaconda3<br />安装完成之后，激活conda base环境：
```bash
eval "$(/mnt/data3/home/zjl/software/anaconda3/bin/conda shell.bash hook)"
```
验证是成功安装：
```bash
conda -V
```
换源（非必须）
<a name="kPBex"></a>
# 4. 安装tensorflow-gpu 1.15
<a name="OpCVm"></a>
## 1.创建conda环境
通过调用下列命令，创建一个名为tfgpu的Conda环境：<br />conda create -n tf1 pip python=3.6<br />等待相应包的安装，如果国内网络太慢的话，可以为conda设置清华源，这样速度能快一点，具体配置过程，网上查一下吧，此处不再讲述。如果看到这样的提示，就证明conda环境创建成功。<br />![](https://cdn.nlark.com/yuque/0/2020/png/602350/1590376264090-1253539b-c099-4dc9-914a-2b8e95da9805.png#align=left&display=inline&height=409&margin=%5Bobject%20Object%5D&originHeight=409&originWidth=976&size=0&status=done&style=none&width=976)
<a name="XCIG9"></a>
## 2.激活环境
**通过以下命令激活conda环境：**
```bash
conda activate tf1
```

<br />这样就进入了刚创建的“tensorflow”环境。<br />![image.png](https://cdn.nlark.com/yuque/0/2020/png/602350/1590376328965-450fc15f-7f0c-48b9-a829-ad236408e66d.png#align=left&display=inline&height=42&margin=%5Bobject%20Object%5D&name=image.png&originHeight=30&originWidth=309&size=2191&status=done&style=none&width=435)
<a name="OFqrf"></a>
## 3.安装tensorflow-gpu
安装GPU版本的tensorflow需要输入以下命令：
```bash
pip install tensorflow-gpu==1.15.0
```
如果只需要安装CPU版本的tensorflow则输入以下命令：
```bash
pip install tensorflow==1.15.0
```
![image.png](https://cdn.nlark.com/yuque/0/2020/png/602350/1590376514116-bdfe16db-cce0-43bc-9f0c-30d61f6eb183.png#align=left&display=inline&height=51&margin=%5Bobject%20Object%5D&name=image.png&originHeight=66&originWidth=1206&size=14325&status=done&style=none&width=941)<br />finished!<br />注意：务必注意一点，在安装完**tensroflow后，由于我们是新创建的conda环境，该环境中基本上是空的，有很多包和IDE并没有安装进来，例如“Ipython”，“spyder”此时如果我们在该环境下打开spyder/Ipyton/jupyter notebook等，会发现其实IDE使用的kernel并不是新建立的这个环境的kernel，而是“base”这个环境的，而“base”环境中我们并没有安装tensorflow，所以一定无法import。这也就是为什么有很多人在安装好tensorflow后仍然在IDE里无法正常使用的原因了。****<br />**通过以下命令安装**Anaconda基础包<br />conda install anaconda
<a name="ASFxc"></a>
## 4. 测试
查看版本：
```
import tensorflow as tf
tf.__version__
```
查看是否使用GPU
```
import tensorflow as tf
tf.test.gpu_device_name()
```
![](https://cdn.nlark.com/yuque/0/2020/png/602350/1590376568257-9b372a6a-0e81-4ad0-9530-3645b41fe245.png#align=left&display=inline&height=145&margin=%5Bobject%20Object%5D&originHeight=145&originWidth=463&size=0&status=done&style=none&width=463)<br />查看在使用哪个GPU
```
from tensorflow.python.client import device_lib
device_lib.list_local_devices()
```
![](https://cdn.nlark.com/yuque/0/2020/png/602350/1590376567034-d90b9885-8d1d-4336-9d75-ea68d50eeeb1.png#align=left&display=inline&height=270&margin=%5Bobject%20Object%5D&originHeight=270&originWidth=800&size=0&status=done&style=none&width=800)<br />

<a name="9BEkm"></a>
# 5. 安装tensorflow-gpu 2.0.0
<a name="ZLwUd"></a>
## 1.创建conda环境
通过调用下列命令，创建一个名为tfgpu的Conda环境：
```bash
conda create -n tf2 pip python=3.6
```
等待相应包的安装，如果国内网络太慢的话，可以为conda设置清华源，这样速度能快一点，具体配置过程，网上查一下吧，此处不再讲述。如果看到这样的提示，就证明conda环境创建成功。<br />![](https://cdn.nlark.com/yuque/0/2020/png/602350/1590376264090-1253539b-c099-4dc9-914a-2b8e95da9805.png#align=left&display=inline&height=409&margin=%5Bobject%20Object%5D&originHeight=409&originWidth=976&size=0&status=done&style=none&width=976)
<a name="Ab2KI"></a>
## 2.激活环境
**通过以下命令激活conda环境：**
```bash
conda activate tf2
```


<a name="V7TmR"></a>
## 3.安装tensorflow-gpu
2.x版本GPU与CPU版本统一安装<br />安装GPU版本的tensorflow需要输入以下命令：
```bash
pip install tensorflow==2.0.0
```
![image.png](https://cdn.nlark.com/yuque/0/2020/png/602350/1590377123019-5de69739-49a7-4c14-8f45-a68192a29baa.png#align=left&display=inline&height=50&margin=%5Bobject%20Object%5D&name=image.png&originHeight=99&originWidth=1199&size=21363&status=done&style=none&width=599.5)<br />finished!
<a name="UeH3o"></a>
## 4. 测试
查看版本：
```bash
import tensorflow as tf
tf.__version__
```
查看是否使用GPU
```
import tensorflow as tf
tf.test.gpu_device_name()
```
![](https://cdn.nlark.com/yuque/0/2020/png/602350/1590376568257-9b372a6a-0e81-4ad0-9530-3645b41fe245.png#align=left&display=inline&height=145&margin=%5Bobject%20Object%5D&originHeight=145&originWidth=463&size=0&status=done&style=none&width=463)<br />查看在使用哪个GPU
```
from tensorflow.python.client import device_lib
device_lib.list_local_devices()
```
![](https://cdn.nlark.com/yuque/0/2020/png/602350/1590376567034-d90b9885-8d1d-4336-9d75-ea68d50eeeb1.png#align=left&display=inline&height=270&margin=%5Bobject%20Object%5D&originHeight=270&originWidth=800&size=0&status=done&style=none&width=800)<br />

<a name="8OwgS"></a>
# 6. 安装pytorch 1.3.1
<a name="BlnAH"></a>
## 1.创建conda环境
通过调用下列命令，创建一个名为tfgpu的Conda环境：
```bash
conda create -y -n torch pip python=3.6
```
等待相应包的安装，如果国内网络太慢的话，可以为conda设置清华源，这样速度能快一点，具体配置过程，网上查一下吧，此处不再讲述。如果看到这样的提示，就证明conda环境创建成功。
<a name="h5pJi"></a>
## 2.激活环境
**通过以下命令激活conda环境：**
```bash
conda activate torch
```


<a name="wWF7q"></a>
## 3.安装torch
[https://pytorch.org/get-started/previous-versions/](https://pytorch.org/get-started/previous-versions/)<br />2.x版本GPU与CPU版本统一安装<br />安装GPU版本的tensorflow需要输入以下命令：
```bash
pip install torch===1.5.0 torchvision===0.6.0 -f https://download.pytorch.org/whl/torch_stable.html
```

<br />finished!
<a name="ssaUk"></a>
## 4. 测试
查看版本：
```bash
import torch
torch.__version__
```
```
from __future__ import print_function
import torch
x = torch.rand(5, 3)
print(x)
```
The output should be something similar to:
```
tensor([[0.3380, 0.3845, 0.3217],
        [0.8337, 0.9050, 0.2650],
        [0.2979, 0.7141, 0.9069],
        [0.1449, 0.1132, 0.1375],
        [0.4675, 0.3947, 0.1426]])
```
Additionally, to check if your GPU driver and CUDA is enabled and accessible by PyTorch, run the following commands to return whether or not the CUDA driver is enabled:
```
import torch
torch.cuda.is_available()
```


