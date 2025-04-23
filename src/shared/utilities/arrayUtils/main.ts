export function getUniqueColumnValues(rows) {
  const uniqueValues: Record<string, Set<any>> = {};
  rows.forEach((obj) => {
      Object.keys(obj).forEach((key) => {
          if (!uniqueValues[key]) {
              uniqueValues[key] = new Set();
          }
          if (Array.isArray(obj[key])) {
              obj[key].forEach((nestedElement: any) => {
                  uniqueValues[key].add(nestedElement);
              });
          } else {
              uniqueValues[key].add(obj[key]);
          }
      });
  });

  const result: Record<string, any[]> = {};
  for (const key in uniqueValues) {
      result[key] = Array.from(uniqueValues[key]);
  }
  return result;
}

function attachNode(children, root, filePath) {
    children.map((e) => {
        if (!root.children) {
            root.children = [
                {
                    name: e,
                    id: e,
                    filePath
                }
            ]
            root = root.children[0];
        }
    });   
}
export const getHierarchy = function (inputArray) {
    const result = new Map();
    for (let index = 0; index < inputArray.length; index++) {
        const s3Obj = inputArray[index];
        const filePath = s3Obj.Key.replace('public/', '');
        const splittedPath = filePath.split('/');
        let root = result.get(splittedPath[0]);
            const element = splittedPath[0];
            if (!root) {
                root = {
                    name: element,
                    id: element,
                    filePath: s3Obj.Key
                }
                result.set(element, root); 
                const children = splittedPath.slice(1);
                children.map((e) => {
                        root.children = [
                            {
                                name: e,
                                id: e,
                                filePath: s3Obj.Key
                            }
                        ]
                        root = root.children[0];
                }); 
            } else {
                const { child,newChild,remainingArray } = getNestedJsonToAdd(result.get(splittedPath[0]), splittedPath.slice(1));
                root = {
                    name: newChild,
                    id: newChild,
                    filePath: s3Obj.Key
                }
                child.children.push(root);
                const children = remainingArray.slice(1);
                attachNode(children, root, s3Obj.Key);
            }  
    }
    return result;
}

function getNestedJsonToAdd(jsonTree,splitted) {
    for (let index = 0; index < splitted.length; index++) {
        const element = splitted[index];
        const child = jsonTree.children.find((e) => element == e.name);
        if (!child) {
            return { child:jsonTree, newChild:element, remainingArray:splitted.slice(index) };
        } else {
            jsonTree = child;
        }
    }
}

export function createGlobalSearchKey(reqBody, globalSearchKeys: string[]): string {
    const globalSearchKey = globalSearchKeys
      .map(key => reqBody[key]?.toLowerCase() || '')
      .join('-');
    return globalSearchKey;
}
  
export function getNodesWithChildren(tree: any): any[] {
    const nodes = [];
    const input = [tree];
    while (input.length > 0) {
      const poppedElement = input.pop();
      if (poppedElement.children && poppedElement.children.length > 0) {
        nodes.push(poppedElement);
        input.push(...poppedElement.children);
      }
    }
    return nodes;
  }