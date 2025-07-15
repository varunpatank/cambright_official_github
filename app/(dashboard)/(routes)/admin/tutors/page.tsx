'use client'

// Admin dashboard for tutor management
// Provides comprehensive UI for managing tutors with real-time updates

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useAdminStatus } from '@/hooks/use-admin-status'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Plus, MoreVertical, Users, UserCheck, UserX, Shield, Eye, Edit, Trash } from 'lucide-react'
import { TutorRole } from '@prisma/client'

interface Tutor {
	id: string
	userId: string
	isActive: boolean
	role: TutorRole
	addedBy: string
	createdAt: string
	updatedAt: string
	auditLogs?: AuditLog[]
}

interface AuditLog {
	id: string
	action: string
	performedBy: string
	details: any
	createdAt: string
}

interface TutorStats {
	total: number
	active: number
	inactive: number
	adminTutors: number
	seniorTutors: number
	regularTutors: number
}

export default function TutorManagementPage() {
	const { userId } = useAuth()
	const { hasAdminAccess, isLoading: adminLoading } = useAdminStatus(userId)
	const [tutors, setTutors] = useState<Tutor[]>([])
	const [stats, setStats] = useState<TutorStats | null>(null)
	const [loading, setLoading] = useState(true)
	const [actionLoading, setActionLoading] = useState<string | null>(null)
	const [newTutorId, setNewTutorId] = useState('')
	const [newTutorRole, setNewTutorRole] = useState<TutorRole>(TutorRole.TUTOR)
	const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
	const [roleFilter, setRoleFilter] = useState<TutorRole | 'all'>('all')
	const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null)
	const [showAddDialog, setShowAddDialog] = useState(false)
	const [showMigrationDialog, setShowMigrationDialog] = useState(false)
	const { toast } = useToast()

	// Fetch tutors and stats
	const fetchData = useCallback(async () => {
		try {
			const params = new URLSearchParams({
				filter: filter === 'all' ? '' : filter,
				role: roleFilter === 'all' ? '' : roleFilter
			})
			
			const response = await fetch(`/api/admin/tutors?${params}`)
			const data = await response.json()
			
			if (response.ok) {
				setTutors(data.tutors)
				setStats(data.stats)
			} else {
				toast({ 
					title: 'Error fetching data', 
					description: data.error || 'Failed to load tutors',
					variant: 'destructive' 
				})
			}
		} catch (error) {
			toast({ 
				title: 'Error', 
				description: 'Failed to fetch tutor data',
				variant: 'destructive' 
			})
		} finally {
			setLoading(false)
		}
	}, [filter, roleFilter, toast])

	// Add new tutor
	const addTutor = async () => {
		if (!newTutorId.trim()) {
			toast({
				title: 'Validation Error',
				description: 'Please enter a valid User ID',
				variant: 'destructive'
			})
			return
		}

		setActionLoading('add')
		try {
			const response = await fetch('/api/admin/tutors', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					userId: newTutorId.trim(),
					role: newTutorRole
				})
			})

			const data = await response.json()

			if (response.ok) {
				toast({ title: 'Success', description: data.message })
				setNewTutorId('')
				setNewTutorRole(TutorRole.TUTOR)
				setShowAddDialog(false)
				fetchData()
			} else {
				toast({ 
					title: 'Error', 
					description: data.error || 'Failed to add tutor',
					variant: 'destructive' 
				})
			}
		} catch (error) {
			toast({ 
				title: 'Error', 
				description: 'Failed to add tutor',
				variant: 'destructive' 
			})
		} finally {
			setActionLoading(null)
		}
	}

	// Update tutor
	const updateTutor = async (userId: string, action: 'activate' | 'deactivate' | 'update_role', role?: TutorRole) => {
		setActionLoading(`${action}-${userId}`)
		try {
			const response = await fetch('/api/admin/tutors', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					userId,
					action,
					role: role || TutorRole.TUTOR
				})
			})

			const data = await response.json()

			if (response.ok) {
				toast({ title: 'Success', description: data.message })
				fetchData()
			} else {
				toast({ 
					title: 'Error', 
					description: data.error || 'Failed to update tutor',
					variant: 'destructive' 
				})
			}
		} catch (error) {
			toast({ 
				title: 'Error', 
				description: 'Failed to update tutor',
				variant: 'destructive' 
			})
		} finally {
			setActionLoading(null)
		}
	}

	// Migrate existing tutors
	const migrateExistingTutors = async () => {
		setActionLoading('migrate')
		try {
			const response = await fetch('/api/admin/tutors/migrate', {
				method: 'POST'
			})

			const data = await response.json()

			if (response.ok) {
				toast({ 
					title: 'Migration Completed', 
					description: `Successfully migrated ${data.results.successful} tutors`
				})
				setShowMigrationDialog(false)
				fetchData()
			} else {
				toast({ 
					title: 'Migration Failed', 
					description: data.message || 'Failed to migrate tutors',
					variant: 'destructive' 
				})
			}
		} catch (error) {
			toast({ 
				title: 'Error', 
				description: 'Migration failed',
				variant: 'destructive' 
			})
		} finally {
			setActionLoading(null)
		}
	}

	// Role badge styling
	const getRoleBadgeVariant = (role: TutorRole) => {
		switch (role) {
			case TutorRole.ADMIN_TUTOR: return 'destructive'
			case TutorRole.SENIOR_TUTOR: return 'default'
			case TutorRole.TUTOR: return 'secondary'
			default: return 'outline'
		}
	}

	useEffect(() => {
		fetchData()
	}, [fetchData])

	// Admin authorization check
	if (adminLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin" />
				<span className="ml-2">Checking permissions...</span>
			</div>
		)
	}

	if (!hasAdminAccess) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<h3 className="text-lg font-medium">Access Denied</h3>
					<p className="text-muted-foreground">
						You don&apos;t have permission to access this admin panel.
					</p>
				</div>
			</div>
		)
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		)
	}

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Tutor Management</h1>
					<p className="text-muted-foreground">
						Manage tutor permissions and access levels
					</p>
				</div>
				<div className="flex gap-2">
					<Dialog open={showMigrationDialog} onOpenChange={setShowMigrationDialog}>
						<DialogTrigger asChild>
							<Button variant="outline">
								<Users className="h-4 w-4 mr-2" />
								Migrate Existing
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Migrate Existing Tutors</DialogTitle>
								<DialogDescription>
									This will import tutors from environment variables or default configuration into the database.
								</DialogDescription>
							</DialogHeader>
							<div className="flex justify-end gap-2 pt-4">
								<Button 
									variant="outline" 
									onClick={() => setShowMigrationDialog(false)}
								>
									Cancel
								</Button>
								<Button 
									onClick={migrateExistingTutors}
									disabled={actionLoading === 'migrate'}
								>
									{actionLoading === 'migrate' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
									Start Migration
								</Button>
							</div>
						</DialogContent>
					</Dialog>

					<Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Add Tutor
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add New Tutor</DialogTitle>
								<DialogDescription>
									Enter the Clerk User ID and select the role for the new tutor.
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 pt-4">
								<div>
									<label className="text-sm font-medium">Clerk User ID</label>
									<Input
										placeholder="user_2qXIVoVecRtbBCOb3tkReZHhEYt"
										value={newTutorId}
										onChange={(e) => setNewTutorId(e.target.value)}
									/>
								</div>
								<div>
									<label className="text-sm font-medium">Role</label>
									<Select value={newTutorRole} onValueChange={(value) => setNewTutorRole(value as TutorRole)}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value={TutorRole.TUTOR}>Tutor</SelectItem>
											<SelectItem value={TutorRole.SENIOR_TUTOR}>Senior Tutor</SelectItem>
											<SelectItem value={TutorRole.ADMIN_TUTOR}>Admin Tutor</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="flex justify-end gap-2 pt-4">
								<Button variant="outline" onClick={() => setShowAddDialog(false)}>
									Cancel
								</Button>
								<Button 
									onClick={addTutor}
									disabled={actionLoading === 'add'}
								>
									{actionLoading === 'add' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
									Add Tutor
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Stats Cards */}
			{stats && (
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					{/* Check if database connection failed */}
					{stats.total < 0 ? (
						<Card className="col-span-full">
							<CardHeader>
								<CardTitle className="text-destructive flex items-center">
									<Shield className="h-5 w-5 mr-2" />
									Database Connection Failed
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									Unable to connect to the database. Please check the database connection and try again.
								</p>
								<Button 
									variant="outline" 
									className="mt-4" 
									onClick={fetchData}
									disabled={loading}
								>
									{loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
									Retry Connection
								</Button>
							</CardContent>
						</Card>
					) : (
						<>
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stats.total}</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-sm font-medium">Active Tutors</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-green-600">{stats.active}</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-sm font-medium">Inactive Tutors</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-sm font-medium">Admin Tutors</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-blue-600">
										{stats.adminTutors || 0}
									</div>
								</CardContent>
							</Card>
						</>
					)}
				</div>
			)}

			{/* Filters */}
			<div className="flex gap-4">
				<Select value={filter} onValueChange={(value) => setFilter(value as any)}>
					<SelectTrigger className="w-[180px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="active">Active Only</SelectItem>
						<SelectItem value="inactive">Inactive Only</SelectItem>
					</SelectContent>
				</Select>

				<Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as any)}>
					<SelectTrigger className="w-[180px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Roles</SelectItem>
						<SelectItem value={TutorRole.TUTOR}>Tutor</SelectItem>
						<SelectItem value={TutorRole.SENIOR_TUTOR}>Senior Tutor</SelectItem>
						<SelectItem value={TutorRole.ADMIN_TUTOR}>Admin Tutor</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Tutors List */}
			<div className="space-y-3">
				{tutors.length === 0 ? (
					<Card>
						<CardContent className="flex items-center justify-center py-8">
							<div className="text-center">
								<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
								<h3 className="text-lg font-medium">No tutors found</h3>
								<p className="text-muted-foreground">
									Add some tutors or adjust your filters
								</p>
							</div>
						</CardContent>
					</Card>
				) : (
					tutors.map((tutor) => (
						<Card key={tutor.id}>
							<CardContent className="flex items-center justify-between p-4">
								<div className="flex items-center space-x-4">
									<div className="flex items-center space-x-2">
										{tutor.isActive ? (
											<UserCheck className="h-5 w-5 text-green-600" />
										) : (
											<UserX className="h-5 w-5 text-red-600" />
										)}
										<div>
											<p className="font-medium font-mono text-sm">{tutor.userId}</p>
											<p className="text-sm text-muted-foreground">
												Added {new Date(tutor.createdAt).toLocaleDateString()}
											</p>
										</div>
									</div>
									<Badge variant={getRoleBadgeVariant(tutor.role)}>
										{tutor.role.replace('_', ' ')}
									</Badge>
									<Badge variant={tutor.isActive ? 'default' : 'secondary'}>
										{tutor.isActive ? 'Active' : 'Inactive'}
									</Badge>
								</div>

								<div className="flex items-center space-x-2">
									{tutor.isActive ? (
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button 
													variant="outline" 
													size="sm"
													disabled={actionLoading === `deactivate-${tutor.userId}`}
												>
													{actionLoading === `deactivate-${tutor.userId}` && (
														<Loader2 className="h-3 w-3 mr-1 animate-spin" />
													)}
													Deactivate
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Confirm Deactivation</AlertDialogTitle>
													<AlertDialogDescription>
														Are you sure you want to deactivate this tutor? They will lose all tutor privileges immediately.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => updateTutor(tutor.userId, 'deactivate')}
													>
														Deactivate
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									) : (
										<Button 
											variant="outline" 
											size="sm"
											onClick={() => updateTutor(tutor.userId, 'activate', tutor.role)}
											disabled={actionLoading === `activate-${tutor.userId}`}
										>
											{actionLoading === `activate-${tutor.userId}` && (
												<Loader2 className="h-3 w-3 mr-1 animate-spin" />
											)}
											Reactivate
										</Button>
									)}

									<Dialog>
										<DialogTrigger asChild>
											<Button variant="ghost" size="sm">
												<Eye className="h-4 w-4" />
											</Button>
										</DialogTrigger>
										<DialogContent className="max-w-2xl">
											<DialogHeader>
												<DialogTitle>Tutor Details</DialogTitle>
												<DialogDescription>
													View audit logs and detailed information
												</DialogDescription>
											</DialogHeader>
											<div className="space-y-4">
												<div className="grid grid-cols-2 gap-4">
													<div>
														<label className="text-sm font-medium">User ID</label>
														<p className="font-mono text-sm">{tutor.userId}</p>
													</div>
													<div>
														<label className="text-sm font-medium">Role</label>
														<p className="text-sm">{tutor.role.replace('_', ' ')}</p>
													</div>
													<div>
														<label className="text-sm font-medium">Status</label>
														<p className="text-sm">{tutor.isActive ? 'Active' : 'Inactive'}</p>
													</div>
													<div>
														<label className="text-sm font-medium">Added</label>
														<p className="text-sm">{new Date(tutor.createdAt).toLocaleString()}</p>
													</div>
												</div>
												
												{tutor.auditLogs && tutor.auditLogs.length > 0 && (
													<div>
														<label className="text-sm font-medium">Recent Activity</label>
														<div className="mt-2 space-y-2">
															{tutor.auditLogs.map((log) => (
																<div key={log.id} className="text-sm p-2 bg-muted rounded">
																	<div className="flex justify-between">
																		<span className="font-medium">{log.action}</span>
																		<span className="text-muted-foreground">
																			{new Date(log.createdAt).toLocaleString()}
																		</span>
																	</div>
																	<p className="text-muted-foreground">
																		by {log.performedBy}
																	</p>
																</div>
															))}
														</div>
													</div>
												)}
											</div>
										</DialogContent>
									</Dialog>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	)
} 