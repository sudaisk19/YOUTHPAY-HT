import React from 'react';

type GlobalStorePropTypes = {
  children: React.ReactNode;
};

function GlobalStore(props: GlobalStorePropTypes) {
  return <>{props.children}</>;
}

export { GlobalStore };
