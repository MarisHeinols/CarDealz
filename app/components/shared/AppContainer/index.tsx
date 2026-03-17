import { Container, type ContainerProps } from "@mui/material";

/**
 * Consistent app-wide page width + gutters.
 * Uses almost full width, but caps on very large screens.
 */
export default function AppContainer(props: ContainerProps) {
  const { sx, ...rest } = props;
  return (
    <Container
      maxWidth={false}
      sx={{
        maxWidth: 1600,
        px: { xs: 2, md: 4 },
        ...sx,
      }}
      {...rest}
    />
  );
}

