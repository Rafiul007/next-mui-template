"use client";

import { useState } from "react";
import {
  AccountTreeRounded,
  AddRounded,
  BusinessRounded,
  GroupsRounded,
  HubRounded,
  PersonRounded,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  alpha,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import type { RhfSelectOption } from "@/components/form";
import { SummaryCard } from "@/components/ui";
import {
  AddOrgNodeDocument,
  GetDepartmentsDocument,
  GetOrgChartDocument,
  GetUsersDocument,
  type GetOrgChartQuery,
  type GetUsersQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";
import { OrgNodeFormDialog, type OrgNodeFormValues } from "./OrgNodeFormDialog";
import { DepartmentsWorkspace } from "./DepartmentsWorkspace";

type OrgNodeData = Omit<GetOrgChartQuery["getOrgChart"][number], "children"> & {
  children?: OrgNodeData[];
};
type UserRecord = NonNullable<GetUsersQuery["getUsers"][number]>;

type FlatNode = {
  id: string;
  name: string;
  level: string;
  managerId: string | null;
  parentId: string | null;
  parentName: string | null;
  depth: number;
  tenantId: string;
};

const buildNodeLookup = (nodes: OrgNodeData[]): Map<string, string> => {
  const map = new Map<string, string>();
  const visit = (list: OrgNodeData[]) => {
    for (const node of list) {
      map.set(node.id, node.name);
      if (node.children?.length) visit(node.children);
    }
  };
  visit(nodes);
  return map;
};

const flattenTree = (
  nodes: OrgNodeData[],
  nodeLookup: Map<string, string>,
  depth = 0,
): FlatNode[] =>
  nodes.flatMap((node) => [
    {
      id: node.id,
      name: node.name,
      level: node.level,
      managerId: node.managerId ?? null,
      parentId: node.parentId ?? null,
      parentName: node.parentId
        ? (nodeLookup.get(node.parentId) ?? null)
        : null,
      depth,
      tenantId: node.tenantId,
    },
    ...flattenTree(node.children ?? [], nodeLookup, depth + 1),
  ]);

const formatUserName = (user: UserRecord) =>
  `${user.firstName} ${user.lastName}`.trim() || user.email;

const emptyFormValues: OrgNodeFormValues = {
  name: "",
  level: "",
  parentId: "",
  managerId: "",
};

const buildColumns = ({
  userLookup,
}: {
  userLookup: Map<string, string>;
}): MRT_ColumnDef<FlatNode>[] => [
  {
    accessorKey: "name",
    header: "Name",
    size: 260,
    Cell: ({ row }) => (
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ pl: row.original.depth * 2.5 }}
      >
        <HubRounded
          sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }}
        />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {row.original.name}
        </Typography>
      </Stack>
    ),
  },
  {
    accessorKey: "level",
    header: "Level",
    size: 160,
    Cell: ({ cell }) => (
      <Chip label={String(cell.getValue())} size="small" variant="outlined" />
    ),
  },
  {
    id: "parent",
    accessorFn: (row) => row.parentName ?? "—",
    header: "Reports To",
    size: 200,
    Cell: ({ cell }) => (
      <Typography
        variant="body2"
        color={cell.getValue() === "—" ? "text.disabled" : undefined}
      >
        {String(cell.getValue())}
      </Typography>
    ),
  },
  {
    id: "manager",
    accessorFn: (row) =>
      row.managerId ? (userLookup.get(row.managerId) ?? "Unknown") : "—",
    header: "Manager",
    size: 200,
    Cell: ({ row, cell }) => (
      <Stack direction="row" spacing={1} alignItems="center">
        <PersonRounded sx={{ fontSize: 16, color: "text.secondary" }} />
        <Typography
          variant="body2"
          color={!row.original.managerId ? "text.disabled" : undefined}
        >
          {String(cell.getValue())}
        </Typography>
      </Stack>
    ),
  },
];

export function OrgChartWorkspace() {
  const [activeTab, setActiveTab] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formDialogKey, setFormDialogKey] = useState(0);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

  const {
    data: orgData,
    error: orgError,
    loading: isOrgLoading,
    refetch: refetchOrg,
  } = useQuery(GetOrgChartDocument);

  const {
    data: usersData,
    error: usersError,
    loading: isUsersLoading,
  } = useQuery(GetUsersDocument, { variables: { page: 1, limit: 200 } });

  const { data: deptData } = useQuery(GetDepartmentsDocument);

  const [addOrgNode, addOrgNodeState] = useMutation(AddOrgNodeDocument);

  const rootNodes = orgData?.getOrgChart ?? [];
  const users = (usersData?.getUsers ?? []).filter(
    (u): u is UserRecord => !!u,
  );

  const nodeLookup = buildNodeLookup(rootNodes);
  const flatNodes = flattenTree(rootNodes, nodeLookup);
  const userLookup = new Map(users.map((u) => [u.id, formatUserName(u)]));

  const totalCount = flatNodes.length;
  const rootCount = rootNodes.length;
  const managedCount = flatNodes.filter((n) => !!n.managerId).length;
  const deptCount = deptData?.getDepartments?.length ?? 0;

  const nodeOptions: RhfSelectOption[] = [
    { label: "None (root node)", value: "" },
    ...flatNodes.map((n) => ({ label: n.name, value: n.id })),
  ];

  const managerOptions: RhfSelectOption[] = [
    { label: "None", value: "" },
    ...users.map((u) => ({ label: formatUserName(u), value: u.id })),
  ];

  const isSubmitting = addOrgNodeState.loading;
  const isLoading = isOrgLoading || isUsersLoading;
  const loadError = orgError ?? usersError;

  const openForm = () => {
    setFormErrorMessage(null);
    setFormDialogKey((k) => k + 1);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (!isSubmitting) {
      setIsFormOpen(false);
      setFormErrorMessage(null);
    }
  };

  const handleSubmit = async (values: OrgNodeFormValues) => {
    setFormErrorMessage(null);
    try {
      const result = await addOrgNode({
        variables: {
          node: {
            name: values.name.trim(),
            level: values.level.trim(),
            parentId: values.parentId?.trim() || undefined,
            managerId: values.managerId?.trim() || undefined,
          },
        },
      });
      if (result.error) throw result.error;
      await refetchOrg();
      toast.success("Organization node added.");
      setIsFormOpen(false);
    } catch (error) {
      const message = getErrorMessage(error, "Unable to add node.");
      setFormErrorMessage(message);
      toast.error(message);
    }
  };

  return (
    <>
      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            border: "1px solid",
            borderColor: "divider",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(240,253,250,0.98) 100%)",
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            spacing={3}
          >
            <Box sx={{ maxWidth: 760 }}>
              <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
                Organization & Departments
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Manage your reporting hierarchy and functional departments in one place.
              </Typography>
            </Box>
            {activeTab === 0 && (
              <Box
                sx={{
                  minWidth: { lg: 240 },
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: { xs: "stretch", lg: "flex-end" },
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<AddRounded />}
                  onClick={openForm}
                  fullWidth
                  sx={{
                    maxWidth: { xs: "100%", lg: 220 },
                    backgroundColor: primaryGradient,
                  }}
                >
                  Add Node
                </Button>
              </Box>
            )}
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(4, minmax(0, 1fr))",
            },
          }}
        >
          <SummaryCard
            caption="Org Nodes"
            title={String(totalCount)}
            icon={<AccountTreeRounded />}
          />
          <SummaryCard
            caption="Root Nodes"
            title={String(rootCount)}
            icon={<HubRounded />}
            tone="success"
          />
          <SummaryCard
            caption="With Manager"
            title={String(managedCount)}
            icon={<GroupsRounded />}
          />
          <SummaryCard
            caption="Departments"
            title={String(deptCount)}
            icon={<BusinessRounded />}
            tone="success"
          />
        </Box>

        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ px: 2.5, borderBottom: "1px solid", borderColor: "divider", bgcolor: "#fff" }}
          >
            <Tab label="Org Chart" icon={<AccountTreeRounded sx={{ fontSize: 18 }} />} iconPosition="start" />
            <Tab label={`Departments${deptCount > 0 ? ` (${deptCount})` : ""}`} icon={<BusinessRounded sx={{ fontSize: 18 }} />} iconPosition="start" />
          </Tabs>

          {activeTab === 1 && (
            <Box sx={{ p: 2 }}>
              <DepartmentsWorkspace />
            </Box>
          )}

          {activeTab === 0 && (
            <Box sx={{ p: 2 }}>
              {loadError ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {loadError.message || "Unable to load organization data."}
                </Alert>
              ) : null}

        <MaterialReactTable
          columns={buildColumns({ userLookup })}
          data={flatNodes}
          enableColumnFilters
          enableDensityToggle={false}
          enableFullScreenToggle={false}
          enableHiding={false}
          enableSorting
          enableStickyHeader
          getRowId={(row) => row.id}
          initialState={{ pagination: { pageIndex: 0, pageSize: 20 } }}
          localization={{ noRecordsToDisplay: "No organization nodes yet" }}
          muiSearchTextFieldProps={{
            placeholder: "Search nodes",
            size: "small",
            sx: { minWidth: { xs: "100%", md: 280 } },
          }}
          muiBottomToolbarProps={{
            sx: {
              borderTop: "1px solid",
              borderColor: alpha("#0f172a", 0.08),
              bgcolor: "#ffffff",
            },
          }}
          muiTableBodyRowProps={{
            sx: {
              bgcolor: "#ffffff",
              transition: "background-color 140ms ease",
              "&:hover td": { bgcolor: alpha("#eff6ff", 0.9) },
            },
          }}
          muiTableBodyCellProps={{
            sx: {
              bgcolor: "#ffffff",
              borderBottom: "1px solid",
              borderColor: alpha("#0f172a", 0.06),
              py: 2.25,
            },
          }}
          muiTableContainerProps={{ sx: { maxHeight: 600, bgcolor: "#ffffff" } }}
          muiTableHeadCellProps={{
            sx: {
              bgcolor: "#ffffff",
              color: alpha("#0f172a", 0.72),
              fontSize: 13,
              fontWeight: 700,
              py: 1.75,
              borderBottom: "1px solid",
              borderColor: alpha("#0f172a", 0.08),
              "& .MuiInputBase-root": {
                bgcolor: alpha("#f8fafc", 0.92),
                borderRadius: 2,
              },
            },
          }}
          muiTablePaperProps={{
            elevation: 0,
            sx: {
              border: "1px solid",
              borderColor: alpha("#0f172a", 0.08),
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "#ffffff",
              boxShadow: `0 16px 40px ${alpha("#0f172a", 0.06)}`,
            },
          }}
          muiTopToolbarProps={{
            sx: {
              px: 2.5,
              py: 1.75,
              bgcolor: "#ffffff",
              borderBottom: "1px solid",
              borderColor: alpha("#0f172a", 0.08),
            },
          }}
          renderEmptyRowsFallback={() => (
            <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                No nodes yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Start by adding your top-level department or division.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddRounded />}
                onClick={openForm}
                sx={{ mt: 2 }}
              >
                Add first node
              </Button>
            </Box>
          )}
          renderTopToolbarCustomActions={() => (
            <Typography variant="body2" color="text.secondary">
              {totalCount} node{totalCount === 1 ? "" : "s"} across{" "}
              {rootCount} root department{rootCount === 1 ? "" : "s"}
            </Typography>
          )}
          state={{ isLoading, showProgressBars: isLoading }}
        />
            </Box>
          )}
        </Paper>
      </Stack>

      <OrgNodeFormDialog
        key={formDialogKey}
        errorMessage={formErrorMessage}
        initialValues={emptyFormValues}
        isSubmitting={isSubmitting}
        managerOptions={managerOptions}
        nodeOptions={nodeOptions}
        onClose={closeForm}
        onSubmit={handleSubmit}
        open={isFormOpen}
      />
    </>
  );
}
