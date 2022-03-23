# What it is trying to do?

Starting from the root problem: UI tree updating, let's assume we are the react creator, and try to solve the problem from scratch/reverse engineering.
Can we come up with a solution somehow similar to the current React source code? --- see update below


## Update on the end of 2021
I do not have time to polish the code this year, as I was dragged to some backend stuffs. You can still get hints from the early commits messages, on what fiber is, why using linklist and why recursion should be avoided.

I do want to share something interesting I learn, from the discussion with other open source contributors.

Today, React is not just a UI framework. Perhaps, the most important and challenging task is not about commiting data to the doms, but to find a smart and efficient way to __calculate a diff in the output, based on a diff in the input__.

If you look React from the way to it computes the diff, it does share some similarities with a build system like typescript compiler: as they both need to do one job: __incremental computation__.


https://user-images.githubusercontent.com/9324418/142946615-5fcdffa3-ff8b-42bb-be07-ac2e940bd5ba.mov

Special thanks to the inspiration & discussion & guidance from [@Lucifier129](https://github.com/Lucifier129)

His sharing https://mp.weixin.qq.com/s/Zg-snOR7BG6l6DojqzO3Yg

Build Systems à la Carte: Theory and Practice
https://www.microsoft.com/en-us/research/uploads/prod/2020/04/build-systems-jfp.pdf

Chris Penner: React is just a specialized composable build system!
https://twitter.com/chrislpenner/status/1374159447577161731

Anders Hejlsberg on Modern Compiler Construction
https://www.youtube.com/watch?v=wSdV1M7n4gQ

Recoil is an experimental state management library for React apps.
https://github.com/facebookexperimental/Recoil
https://github.com/facebookexperimental/Recoil/issues/1020

Michel Weststrate earlier tweet about recoil vs mobx vs redux
https://twitter.com/mweststrate/status/1261369870152871937?s=20

---

This is just a world of fun and magic :)
