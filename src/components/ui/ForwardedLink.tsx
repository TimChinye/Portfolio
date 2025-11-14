import { forwardRef } from 'react';
import { CustomLink } from './CustomLink';

const ForwardedLink = forwardRef<HTMLAnchorElement, React.ComponentProps<typeof CustomLink>>(
	(props, ref) => <CustomLink {...props} ref={ref} />
);
ForwardedLink.displayName = 'ForwardedCustomLink';

export { ForwardedLink };