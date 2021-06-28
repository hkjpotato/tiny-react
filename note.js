/**
 * 
 * 
 * type & key is the same. then regard it as same 
 * 
 * 考虑实际遇到的情况多不多
 * 场景少的，就不因为他去复用
 * 
 * 特别是要复用需要进行复杂的操作
 * 
 * 同级别能否重复 是用keyvalue的map
 * 这是遍历的方式导致的？
 * 
 * 同一level(depth)，key, 还有 “type”才进行复用
 * 
 * LIS 和 key value map遍历优化是因为数据结构
 * 
 * vue的颗粒度够小了
 * 
 * transition <=> message channel
 * 
 * array/linkedlist
 * 
 * map is based on array
 * 
 * react use linkedlist to deal with a group of data except for deletion (array, was linkedlist)
 */