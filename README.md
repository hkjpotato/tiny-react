# What it is trying to do?

Starting from the root problem: UI tree updating, let's assume we are the react creator, and try to solve the problem from scratch/reverse engineering.
Can we come up with a solution somehow similar to the current React source code?


# update on the end of 2021
I do not have time to polish the code this year, was dragged to some backend stuffs. I will find some time next year.

I do want to share something interesting I learned, from the discussion within other open source contributors, TC39 member, and actually from some designs of AWS backend system :) 

React is not just a UI library. Actually, the most important/challenging task is not to commiting to dom, but to find a smart and efficient way to calculate a diff in output, based on a diff input in another domain.

If you look React from the way to it computes the diff, it does share some similarities with a build system like typescript compiler: as they both need to do one job, which is "incremental computation".


https://user-images.githubusercontent.com/9324418/142946615-5fcdffa3-ff8b-42bb-be07-ac2e940bd5ba.mov

Special thanks to inspiration from @Lucifier129
His sharing:https://mp.weixin.qq.com/s/Zg-snOR7BG6l6DojqzO3Yg

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

This is just a fun world
