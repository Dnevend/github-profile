import { gitFetchFunc } from "@classy/lib";
import { Repo as IRepo, RepoContent } from "@classy/types";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import MarkdownPreview from "@uiw/react-markdown-preview";

function replaceRelativeSourcePaths(
  markdownString: string,
  replacementPath: string
) {
  // 匹配图片的Markdown语法 ![alt text](relativePath)
  const regex = /(!\[[^\]]*\]\()([^\)]+\.(?:jpg|jpeg|gif|png|bmp|svg))(?=\))/gi;

  // 使用replace方法来替换匹配到的相对路径
  const replacedString = markdownString.replace(regex, (_match, p1, p2) => {
    // p1 是 ![alt text]( 部分，p2 是图片相对路径
    // 这里将相对路径替换为指定的路径地址
    return p1 + replacementPath + p2;
  });

  return replacedString;
}

/** FIXME: 匹配以`/`开头或者无初始路径标识符的相对路径 */
function replaceRelativePaths(markdownString: string, replacementPath: string) {
  // 匹配Markdown中的链接地址，包括图片和视频的Markdown语法 ![alt text](relativePath)
  const regex = /\((\.{1,2}\/[^\)]+)\)/g;

  // 使用replace方法来替换匹配到的相对路径
  const replacedString = markdownString.replace(regex, (_match, p1) => {
    // 将相对路径替换为指定的路径地址
    return "(" + replacementPath + p1 + ")";
  });

  return replacedString;
}

function replaceRelativePathsInHTML(
  markdownString: string,
  absolutePath: string
) {
  // 正则表达式用于匹配HTML标签中的相对路径
  var regex =
    /(<(?:img|a)\s+(?:[^>]*?\s+)?(?:src|href)\s*=\s*['"])(\.\/|\.\.\/)([^'"]+)(['"])/gi;

  // 使用replace方法将匹配到的相对路径替换为绝对路径
  var replacedString = markdownString.replace(
    regex,
    function (_match, p1, _p2, p3, p4) {
      return p1 + absolutePath + "/" + p3 + p4;
    }
  );

  return replacedString;
}

/**
 * Review Address
 * /ant-design/repo/ant-design
 * /React95/repo/React95
 */

export function Repo() {
  const [params] = useSearchParams();
  const { user, repo } = useParams() as { user: string; repo: string };

  // 目标渲染文件
  const renderFilePath = params.get("path");

  const [repository, setRepo] = useState<IRepo | null>(null);
  const [repoContents, setRepoContents] = useState<RepoContent[]>([]);
  const [absPath, setAbsPath] = useState<string>();
  const [renderContent, setRenderContent] = useState<string>();

  useEffect(() => {
    (async () => {
      const data = await gitFetchFunc.userRepo(user, repo);
      setRepo(data);
    })();

    (async () => {
      const data = await gitFetchFunc.repoContents(user, repo);
      setRepoContents(data);
    })();
  }, [user, repo]);

  useEffect(() => {
    // FIXME: 调整匹配规则 README.md > other.md > readme.other > ./docs/README.md > ./docs/other.md
    const readmeRawUrl = repoContents.find((it) =>
      it.name.toLowerCase().includes("readme")
    )?.download_url;

    if (!readmeRawUrl) return;

    const absPath = readmeRawUrl.substring(
      0,
      readmeRawUrl.lastIndexOf("/") + 1
    );
    setAbsPath(absPath);

    // 当指定要渲染的文件时，不进行README文件渲染
    if (renderFilePath) return;

    (async () => {
      const data = await fetch(readmeRawUrl);
      if (data.ok) {
        let _content = await data.text();
        // TODO: 地址替换时，忽略Markdown中代码片段```内的地址

        // 替换资源类型文件路径为`https://raw.githubusercontent.com/...`文件源地址以进行预览展示
        _content = replaceRelativeSourcePaths(_content, absPath);
        // 其他路径替换为`?path=...`点击后重新渲染指定路径文件
        _content = replaceRelativePaths(_content, "?path=");
        // 替换Markdown中的HTML链接地址为绝对路径
        _content = replaceRelativePathsInHTML(_content, absPath);
        setRenderContent(_content);
      }
    })();
  }, [repoContents, renderFilePath]);

  useEffect(() => {
    if (!absPath || !renderFilePath) return;

    const relativePath = renderFilePath.substring(
      0,
      renderFilePath.lastIndexOf("/") + 1
    );

    (async () => {
      const data = await fetch(`${absPath}${renderFilePath}`);
      if (data.ok) {
        let _content = await data.text();
        _content = replaceRelativeSourcePaths(
          _content,
          `${absPath}${relativePath}`
        );
        _content = replaceRelativePaths(_content, `?path=${relativePath}`);
        _content = replaceRelativePathsInHTML(_content, absPath);
        setRenderContent(_content);
      }
    })();
  }, [renderFilePath, absPath]);

  return (
    <div>
      <h1 className="text-center">{repository?.name}</h1>
      <p className="text-sm text-center text-slate-500">
        {repository?.description}
      </p>
      {/* TODO: 添加过加载效果 */}
      <div className="my-6">
        <MarkdownPreview source={renderContent} />
      </div>
    </div>
  );
}

export default Repo;
