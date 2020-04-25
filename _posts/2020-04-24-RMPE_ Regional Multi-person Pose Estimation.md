---
title: RMPE Regional Multi-person Pose Estimation
layout: article
aside:
  toc: true
key: RMPE-AlphaPose
show_title: true
tags: paper pose
---

# 

[paper](https://arxiv.org/abs/1612.00137v3)	[code](https://github.com/MVIG-SJTU/AlphaPose/tree/pytorch)
<a name="Summary"></a>
## Summary
这篇论文是上海交大和腾讯优图的论文，被 ICCV 2017接收。它对于多人姿态估计的方法采用传统的自顶向下的方法，即先检测人，再识别人体姿态。检测使用的是SSD-512，识别人体姿态使用的是state-of-the-art的Stacked Hourglass方法。

<a name="9df44c92"></a>

<!--more-->

## Problem Statement
论文分析了当前姿态估计的两种方法存在的问题——**对于自顶向下的方法，检测的误差是很大的一个影响，即使在检测任务下是正确的，提取的proposal也不适用于单人的姿态估计方法；同时，冗余的检测框也使得单人的姿态被重复估计；对于自底向上的方法，当两个人比较靠近时，人体关键点分配到每个人身上会出错，这也是该方法的challenge。**作者采用自顶向下方法，致力于解决对于imperfect proposal，通过调整，使得crop的person能够被单人姿态估计方法很好的识别，从而克服检测带来的定位误差。
<a name="d00860d5"></a>
## Research Objective
**2D多人姿态估计自顶向下方法**。致力于解决对于imperfect proposal，通过调整，使得crop的person能够被单人姿态估计方法很好的识别，从而克服检测带来的定位误差。
<a name="c9a0d983"></a>
## Method(s)

<br />![image.png](https://cdn.nlark.com/yuque/0/2020/png/602350/1587787928991-fa7b3df7-5f86-4a44-8ee2-d237e2363079.png#align=left&display=inline&height=161&margin=%5Bobject%20Object%5D&name=image.png&originHeight=214&originWidth=787&size=124562&status=done&style=none&width=590)<br />整个过程分为3步：<br />**第一步**是用SSD检测人，获得human proposal<br />**第二步**是将proposal输入到两个并行的分支里面，上面的分支是STN+SPPE+SDTN的结构，即Spatial Transformer Networks + Single Person Pose Estimation + Spatial de- Transformer Networks，STN接收的是human proposal，SDTN产生的是pose proposal。下面并行的分支充当额外的正则化矫正器。<br />**第三步**是对pose proposal做Pose NMS（非最大值抑制），用来消除冗余的pose proposal。
<a name="4gJFX"></a>
### 方法细节

- **Symmetric STN + SPPE + SDTN**

![image.png](https://cdn.nlark.com/yuque/0/2020/png/602350/1587787964046-5e3fa8ee-b511-4f38-b4cd-7ee37c5be833.png#align=left&display=inline&height=279&margin=%5Bobject%20Object%5D&name=image.png&originHeight=288&originWidth=771&size=138412&status=done&style=none&width=746)

- STN： 得到更精准的单人模型
- SDTN：反向变换，还原原图，并产生候选姿态
- SPPE：生成各种姿态


<br />1.将上一步得出的human proposal在长宽方向上个延长20%，以确保可以把人完整的框起来。而且经过验证，这样确实可以把大部分的人整个框起来。<br />2.经过一个STN网络将延伸过的图像进行仿射变换，可以生成一个比较精确的、适合作为SPPE输入。<br />3.把SPPE的输出经过与前边相反的STN变换，将坐标变换回原来的坐标系，完成整个的识别过程。

- **Symmetric STN**

STN是Google DeepMind在2015年提出的Spatial Transformer Networks，相当于在传统的一层Convolution中间，装了一个“插件”（就是矩阵的仿射变换），可以使得传统的卷积带有了裁剪、平移、缩放、旋转等特性；目标是可以减少CNN的训练数据量，以及减少做data argument，让CNN自己学会数据的形状变换，将输入图像做任意空间变换。

- **Parallel SPPE**

并行的SPPE作为正则化作用，用来进一步**加强STN提取优质的human proposal**。这一支的label设置为single person pose。训练时使用2条支路输出的总误差来训练网络，parallel SPPE**所有层参数在训练阶段是固定的**，Parallel SPPE分支和真实姿态的标注进行比较，反向传播中心位置的姿态误差给STN模块。如果STN的姿态不是中心定位，parallel SPPE反向传播较大的误差。通过反向传播的方式**帮助STN聚焦正确的区域**，实现提取高质量人体区域。但是测试阶段，parallel SPPE被禁止。在测试时将下面的 Parallel SPPE丢掉，只使用Symmetric STN进行前向传播。

- **Parametric Pose NMS**

首先选择置信度最高的pose作为参考，靠近它的pose通过淘汰标准来消除。对于剩下的pose，重复上述过程，直到消除冗余姿势，并且仅返回唯一的pose。

- **Pose-guided Proposals Generator**

symmetric STN + SPPE应该用SSD产生的人体建议框充分训练，需要适当的数据增强。这里主要是在训练过程中增加proposal的数量，虽然每一张图片都只有K个人，每个人只会产生一个bbox，但是可以根据ground truth的proposals，生成和其分布相同的多个proposals一起训练。
<a name="Evaluation"></a>
## Evaluation
![image.png](https://cdn.nlark.com/yuque/0/2020/png/602350/1587787984452-7bc29258-9851-4396-b4e0-0f2f7dc0cdae.png#align=left&display=inline&height=249&margin=%5Bobject%20Object%5D&name=image.png&originHeight=332&originWidth=594&size=263937&status=done&style=none&width=446)
<a name="Conclusion"></a>
## Conclusion
wait