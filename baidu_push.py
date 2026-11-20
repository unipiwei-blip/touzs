# -*- coding: utf-8 -*-
"""百度普通收录每日推送 —— www.touzs.com 官网。

用法：
  python baidu_push.py             # 按计划推送当天一批（默认每天 8 条）
  python baidu_push.py --dry       # 只看今天该推哪些，不实际推送
  python baidu_push.py --limit N   # 指定本次最多推送条数

说明：
  token 为账号级，由 site 参数区分站点；同一 token 可用于同账号下的
  lewy / lecyun / hzie / iguancu 等站点，URL 必须与 site 域名一致。
  每站每日配额独立（本站约 10 条），故每天只推一批并跳过已推 URL。

文件：
  sitemap.xml      : 全站 URL 池
  www_touzs_com_pushed.txt  : 已成功推送的 URL
"""
import os
import re
import sys
import json
import urllib.request
import urllib.error

BASE = os.path.dirname(os.path.abspath(__file__))
SITE = "https://www.touzs.com"
TOKEN = "j2VgJCKV4qeY2BpT"
API = "http://data.zz.baidu.com/urls?site=%s&token=%s" % (SITE, TOKEN)
SITEMAP = os.path.join(BASE, "sitemap.xml")
PUSHED = os.path.join(BASE, "www_touzs_com_pushed.txt")
DAILY = 8


def read_urls():
    with open(SITEMAP, encoding="utf-8") as f:
        xml = f.read()
    return [u.strip() for u in re.findall(r"<loc>(.*?)</loc>", xml)
            if u.strip().startswith(SITE)]


def load_pushed():
    if not os.path.exists(PUSHED):
        return set()
    return set(x.strip() for x in open(PUSHED, encoding="utf-8") if x.strip())


def push(urls):
    body = ("\n".join(urls) + "\n").encode("utf-8")
    req = urllib.request.Request(API, data=body,
                                 headers={"User-Agent": "curl/7", "Content-Type": "text/plain"})
    try:
        r = urllib.request.urlopen(req, timeout=30)
        return json.loads(r.read().decode("utf-8", "ignore"))
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode("utf-8", "ignore"))
    except Exception as e:
        return {"error": -1, "message": str(e)}


def main():
    args = sys.argv[1:]
    limit = DAILY
    if "--limit" in args:
        i = args.index("--limit")
        if i + 1 < len(args):
            limit = int(args[i + 1])

    urls = read_urls()
    pushed = load_pushed()
    todo = [u for u in urls if u not in pushed][:limit]
    if "--dry" in args:
        print("今日拟推送 %d 条：" % len(todo))
        for u in todo:
            print("  ", u)
        print("剩余待推 %d 条" % (len([u for u in urls if u not in pushed]) - len(todo)))
        return
    if not todo:
        print("全部 URL 已推送完毕，无待推内容。")
        return

    print("本次推送 %d 条：" % len(todo))
    for u in todo:
        print("  ", u)
    res = push(todo)
    print("接口返回:", json.dumps(res, ensure_ascii=False))
    success = int(res.get("success", 0))
    if success > 0:
        with open(PUSHED, "a", encoding="utf-8") as f:
            for u in todo[:success]:
                f.write(u + "\n")
        print("成功 %d 条，进度已更新。" % success)
    else:
        print("本次无成功推送。")
    if res.get("remain") is not None:
        print("今日剩余配额: %s" % res["remain"])
    left = [u for u in urls if u not in load_pushed()]
    print("仍待推送 %d 条。" % len(left))


if __name__ == "__main__":
    main()
