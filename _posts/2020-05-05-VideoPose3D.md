> *3D human pose estimation in video with temporal convolutions and semi-supervised training*
[paper](https://arxiv.org/abs/1811.11742)    [code](https://github.com/facebookresearch/VideoPose3D)    [project](https://dariopavllo.github.io/VideoPose3D/)

# **Summary**

写完笔记之后最后填，概述文章的内容，以后查阅笔记的时候先看这一段。

# **Problem Statement**

3D poses in video，即从2D video中估计3D skeleton pose

# **Research Objective**

> 1. First, we present a simple and efficient approach for 3D human pose estimation in video based on dilated temporal convolutions on 2D keypoint trajectories
2. Second, we introduce a semi-supervised approach which exploits unlabeled video, and is effective when labeled data is scarce.

提出一种基于**时序扩张卷积**的3D pose模型，在video的2D keypoint检测基础上得到3D pose，在保证准确率的同时比RNN-based方法更有效率(可以同步处理多个frame)；

并提出一种**半监督**方法，只要求相机参数

不利用extra labeled data，达到SOTA

# **Method**

## 网络结构

算法： VideoPose3D

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/c5f85f0e-f537-4f60-8aab-7796191267d0/Untitled.png](https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fc5f85f0e-f537-4f60-8aab-7796191267d0%2FUntitled.png?table=block&id=70cae2df-97cc-447b-bffc-768d72b28384&width=1820&cache=v2)

输入为J个joints的二维坐标，在第一层进行3*3卷积（注意这里是dilation=1的扩张卷积），BN，ReLU和dropout，参数为kernel=3，output=1024，dropout=0.25。之后用4个 Res Block进行跳跃连接，slice中进行的是1D卷积。

## 半监督方法

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/fbdb4813-7de7-459e-bf44-48f880168078/Untitled.png](https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Ffbdb4813-7de7-459e-bf44-48f880168078%2FUntitled.png?table=block&id=48d0f875-4655-4751-b50f-2b580a125d19&width=1150&cache=v2)

# Keypoint

## 1. Dilated Convolution

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/fef4549d-dec2-4f87-be08-84d6ee7a2161/Untitled.png](https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Ffef4549d-dec2-4f87-be08-84d6ee7a2161%2FUntitled.png?table=block&id=bbba0dbf-e752-426c-a564-f25e52083f72&width=1140&cache=v2)

## 2. Causal Convolutions

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/72aeb523-9d02-4cc8-8736-1aff8c3ed3c6/Untitled.png](https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F72aeb523-9d02-4cc8-8736-1aff8c3ed3c6%2FUntitled.png?table=block&id=948484e2-ec5b-416d-b2e3-254e84ccfc56&width=1130&cache=v2)

## 3. Semi-supervised approach

# **Evaluation**

实验结果，作者如何评估自己的方法，实验的setup是什么样的，有没有问题或者可以借鉴的地方。

[实验结果](https://www.notion.so/79dea96834824948bc2e2fd154bd7727)

# **Conclusion**

作者给了哪些结论，哪些是strong conclusions, 哪些又是weak的conclusions?

# **Notes**

## 需改进的点

1. 直接卷积 2DPose 估计3D Pose 太粗暴
2. dilated conv尺度单一，不具有尺度不变性，对于too slow/too fast action不能很好的适应
3. 遮挡问题没有解决
4. 半监督方法中，没有很好的利用global position这个监督信息，只是回归了bone length loss
5. 不如multi-view方法精准

# **Reference**