CREATE TABLE `fa_mod_type` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `uid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户id',
  `pid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '父ID',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '分类名',
  `createtime` bigint(16) DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

CREATE TABLE `fa_mod_note` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `uid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户id',
  `type1` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '',
    `type2` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '分类名',
  `content` text COLLATE utf8mb4_unicode_ci COMMENT '',
  `createtime` bigint(16) DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='笔记';
