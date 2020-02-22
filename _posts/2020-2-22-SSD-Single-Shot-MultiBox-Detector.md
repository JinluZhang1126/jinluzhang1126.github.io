---
title: SSD Single Shot MultiBox Detector
tags: enviroment-setup
layout: article
aside:
  toc: true
key: 2020-2-22-SSD-Single-Shot-MultiBox-Detector
show_title: true
---


> 目标检测中的一个经典one-stage算法——SSD，ECCV2016中Wei Liu提出的，相比于YOLO针对于小目标检测更友好。文章基本按照论文行文思路和结构记笔记，最后给出一个sumary
>
> [论文地址](https://link.springer.com/chapter/10.1007%2F978-3-319-46448-0_2)  [代码地址](https://github.com/balancap/SSD-Tensorflow)
>
> 参考：[SSD论文笔记](https://zhuanlan.zhihu.com/p/58713034), 
> 
<!--more-->

## Abstract

本文提出了一种使用单个深度神经网络来检测图像中的目标的方法，便于训练与优化，同时提高检测速度。**将边界框的输出空间离散化为不同长宽比的一组default box，这些box是通过不同尺寸（分辨率）layer上的feature map得出的，每一层都具有不同的aspect ratios and scales**。在预测阶段，网络会在每个默认框中分别为每个类别生成分数，并对default box进行微调以更好地匹配目标形状。此外，网络还结合了**不同分辨率的多个特征映射**的预测，自然地处理各种尺寸的目标。相对于region proposal的方法，SSD非常简单，因为它完全消除了提出生成和随后的像素或特征重采样阶段，并**将所有计算封装到单个网络**中。

## Introduction

目前主流的目标检测算法分为两种，一种R-CNN流，主要思路是先使用选择性搜索之类的启发式方法（Selective Search）或CNN网络（RPN）生成region proposal，然后在此proposal上生成特征输入到分类和定位网络中，这类方法是**two-stage**的，特点是精度高、速度略慢、训练较复杂；第二种是YOLO为代表的**one-stage**流，它们的思路是均匀地在图片的不同位置进行密集抽样，抽样时可以采用不同的尺度和长宽比，然后利用CNN提取特征后直接进行分类和回归，整个过程只需要一步，所以它们的优势是速度快。但是均匀的密集采样有一个缺点就是正样本和负样本分布极不均衡，这会导致训练困难，导致模型准确度稍低。**（可以通过FocalLoss缓解这个问题）**

由于改进了backbone网络，并且使用了不同分辨率的feature map，所以相比于YOLO流更加准确，尤其是对小物体检测敏感，速度也比faster rcnn更快。SSD属于one-stage，所以本文主要比较的也是YOLO流。

原文这段话感觉概括了SSD的有别于其他方法的主要思想：

> Our improvements include using a small convolutional filter to predict object
> categories and offsets in bounding box locations, using separate predictors (filters) for
> different aspect ratio detections, and applying these filters to multiple feature maps from
> the later stages of a network in order to perform detection at multiple scales

使用VGG这种小卷积核网络进行提取初始目标特征和偏移量，并且针对不同尺度的feature maps产生不同的filter，然后将这种filter应用于之后的detection阶段。

## The Single Shot Detector (SSD)-网络结构

<img src="https://raw.githubusercontent.com/JinluZhang1126/PublicPic/master/Pic/image-20200209121221893.png" alt="image-20200209121221893" style="zoom:150%;" /> 

网络的输入是300 x 300，称为SSD300；除此之外还有输入为500 x 500的SSD500，它在SSD300的基础上又加了一层conv11_2用于检测。

SSD将VGG-16的全连接层fc6和fc7转换成3 x 3的卷积层Conv6和1 x 1的卷积层Conv7，并将pool5从2 x 2 - s2转换成3 x 3 - s1。第一个用于检测的feature map是Conv4_3，由于位置靠前，为了避免与后面的检测层差异太大，所以在Conv4_3后面使用L2 normalization，即仅对每个像素点在channel维度上进行归一化。

可以看出，相比于YOLO网络，SSD主要改进在于：

- VGG16作为特征提取网络；
- 使用不同尺寸的feature map提取出来的不同尺寸和长宽比的default box进行检测和分类。

### 模型关键点

- **多尺度feature map预测**，**SSD网络中分为了6个stage，每个stage能学习到一个特征图，然后进行边框回归和分类**，这些层的尺寸**逐渐减小**，并允许**多尺度**的预测。在Conv4_3、Conv6、Conv7、Conv8_2、Conv9_2、Conv10_2、Pool 11的feature map上都会进行检测，入到后面的*detection per class*层， 提取出来类别概率和坐标：（c, x, y, w, h）

- **VGG网络作为特征提取网络**，去除最后两层FC层，改为3 x 3的卷积层Conv6和1 x 1的卷积层Conv7，并在之后增加尺寸依次减小的4个卷积层

- **使用CNN检测**，这一部分和Faster RCNN中的RPN网络有些类似，对于feature map先使用3 x 3卷积，卷积后的结果代表feature map上每个像素代表的default box的信息，如类别概率或位置信息。

  对于边框回归，只需要**4维向量**即可，分别代表边框缩放尺度(坐标轴两个方向)和平移向量(坐标轴两个方向)。对于分类，SSD网络采取为每个类别进行打分的策略，也就是说对于每个Default Box，SSD网络会计算出相应的**每个类别的分数**。假设数据集类别数为c，加上背景，那么总的类别数就是**c+1**类。SSD网络采用了c+1维向量来分别代表该Default Box对于每个类别所得到的分数。这里，假设是VOC数据集，那么每个Default Box将生成一个20 + 1 + 4 = 25维的特征向量。同样，以Conv9输出特征图5x5为例。抽象地说特征向量就是：**(m\*n)\*k\*(c+4)**

  ![img](https://raw.githubusercontent.com/JinluZhang1126/PublicPic/master/Pic/MgVSAo8.png)

- **Default boxes and aspect ratios**，feature map上每个像素都会生成多个default box。作者充分的吸取了Faster R-CNN中的Anchors机制，在每个Stage中根据Feature Map的大小，按照固定的Scale和Radio生成Default Boxes。这里为了方便阐述，选取了Conv9的Feature Map，输出大小为5x5。SSD网络中作者设置Conv9的每个点默认生成6个box，如下图所示。因此在这一层上，共生成了5x5x6=150个boxes。

  ![img](https://raw.githubusercontent.com/JinluZhang1126/PublicPic/master/Pic/pToKpCA.jpg)

（👆这段解释来自👉[here](https://blog.csdn.net/neu_chenguangq/article/details/79057655),感觉解释的很到位，特此说明）

这样在不同尺度生成default box最大的好处在于可以对各种尺度和形状的物体进行预测：下图中狗的ground truth和4 x 4 feature map中default box匹配，但和8 x 8 feature map的任何一个default box都不匹配，所以SSD相对于RPN考虑更周到

<img src="https://raw.githubusercontent.com/JinluZhang1126/PublicPic/master/Pic/image-20200222105802543.png" alt="image-20200222105802543" style="zoom:67%;" />

### 注意区分dafault box生成和CNN检测

这两个关键点是分开的，default box生成时对于feature map中每一个像素点生成4-6个不同长宽比的box，得到的是每一个cell的不同box

而CNN检测是对每一个cell（也就是像素）进行3*3卷积，得到的是特征向量

这两个我在一开始读论文的时候经常搞不清

### 训练细节

- **如何选择default box的尺寸和长宽比**

  每层特征图上的尺度的default box计算表达式如下：

  ![image-20200209134820257](https://raw.githubusercontent.com/JinluZhang1126/PublicPic/master/Pic/image-20200209134820257.png)

  参数：scale， aspect ratio——每个cell生成固定的scale（s）和aspect ratio（ar）的边界框

  其中 Smin 为最小尺度0.2， Smax 为最大尺度0.95。

  长宽比**ar ∈ {1，2，3，1/2，1/3}**，

  于是default box的宽和高可以通过 ![[公式]](https://www.zhihu.com/equation?tex=w_k%5Ea%3Ds_k%5Csqrt%7Ba_r%7D) 和 ![[公式]](https://www.zhihu.com/equation?tex=h_k%5Ea%3Ds_k%2F%5Csqrt%7Ba_r%7D) 计算，

  除此之外，还增加一个长宽比为1的时候，尺度为 ![[公式]](https://www.zhihu.com/equation?tex=s_k%27%3D%5Csqrt%7Bs_ks_%7Bk%2B1%7D%7D) 的default box，所以feature map上每个像素都有6个default box，**注意这里得到的结果都是相对于原图的比例**。default box中心的坐标就是像素的中心。

- **匹配策略**

  训练时需要建立ground truth和default box之间的对应关系，文中主要采用best jaccard overlap。与MultiBox稍有不同的是：SSD每个ground truth可以与多个default box匹配。

  分为两步：首先对于每个ground truth，找到一个与其IoU最大的default box匹配，这个default box对应的预测框就作为正样本，其余都作为负样本。但这样做会导致负样本过多，正负样本分布极其不均衡，所以还会采取第二步：对于每个ground truth，将与其IoU大于某一阈值（比如0.5）的default box都进行匹配。

  <img src="https://raw.githubusercontent.com/JinluZhang1126/PublicPic/master/Pic/image-20200222113304807.png" alt="image-20200222113304807" style="zoom: 50%;" />

- **损失函数**

  ![image-20200222113449881](https://raw.githubusercontent.com/JinluZhang1126/PublicPic/master/Pic/image-20200222113449881.png)

  <img src="https://raw.githubusercontent.com/JinluZhang1126/PublicPic/master/Pic/image-20200222113710154.png" alt="image-20200222113710154" style="zoom: 50%;" />

  ![[公式]](https://www.zhihu.com/equation?tex=N) 为匹配成功的default box个数； ![[公式]](https://www.zhihu.com/equation?tex=%5Calpha) 是为了权衡两者损失而设置，通过交叉验证发现设置为1更好；第一项是置信度的Softmax损失，注意还包括背景这个类别；第二项是参数化后的bounding box中心坐标、长和宽的Smooth L1损失

- **难例挖掘**

  用于预测的 feature map 上的每个点都对应有 6 个不同的 default box，绝大部分的 default box 都是负样本，导致了正负样本不平衡。在训练过程中，采用了 Hard Negative Mining 的策略（**根据confidence loss对所有的box进行排序，使正负例的比例保持在1:3**） 来平衡正负样本的比率。这样做能提高4%左右。

- **数据增强**

  三个选项：

  - 使用整张图像作为输入
  - 使用IOU和目标物体为0.1、0.3、0.5、0.7和0.9的patch，这些patch在原图的大小的[0.1, 1]之间，相应的宽高比在[1/2, 2]之间。
  - 随机采取一个patch



## Experiment

### Caffe版本

| System                                                       | VOC2007 test *mAP* | **FPS** (Titan X) | Number of Boxes | Input resolution |
| ------------------------------------------------------------ | ------------------ | ----------------- | --------------- | ---------------- |
| [Faster R-CNN (VGG16)](https://github.com/ShaoqingRen/faster_rcnn) | 73.2               | 7                 | ~6000           | ~1000 x 600      |
| [YOLO (customized)](http://pjreddie.com/darknet/yolo/)       | 63.4               | 45                | 98              | 448 x 448        |
| SSD300* (VGG16)                                              | 77.2               | 46                | 8732            | 300 x 300        |
| SSD512* (VGG16)                                              | **79.8**           | 19                | 24564           | 512 x 512        |

### TF版本（[代码](https://github.com/balancap/SSD-Tensorflow)）

| Model                                                        | Training data          | Testing data | mAP   | FPS  |
| ------------------------------------------------------------ | ---------------------- | ------------ | ----- | ---- |
| [SSD-300 VGG-based](https://drive.google.com/open?id=0B0qPCUZ-3YwWZlJaRTRRQWRFYXM) | VOC07+12 trainval      | VOC07 test   | 0.778 | -    |
| [SSD-300 VGG-based](https://drive.google.com/file/d/0B0qPCUZ-3YwWUXh4UHJrd1RDM3c/view?usp=sharing) | VOC07+12+COCO trainval | VOC07 test   | 0.817 | -    |
| [SSD-512 VGG-based](https://drive.google.com/open?id=0B0qPCUZ-3YwWT1RCLVZNN3RTVEU) | VOC07+12+COCO trainval | VOC07 test   | 0.837 | -    |

## 总结

1. **和YOLO一样不同类别之间共享回归器，所以易混淆相似的类别**
2. **对小物体的检测相对于YOLO好一点**
3. **比YOLOv1快且精准度高，比Faster R-CNN精度略低**
4. SSD整个网络采取了one stage的思想，以此提高检测速度。并且网络中融入了Faster R-CNN中的anchors思想，并且做了特征分层提取并依次计算边框回归和分类操作。总之，这是一个延申RPN网络思想，同时又结合YOLO框架的方法。