import { IconBadge } from '@/components/icon-badge'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { TitleForm } from '@/app/(dashboard)/(routes)/tutor/courses/[courseId]/_components/title-form'
import { DescriptionForm } from '@/app/(dashboard)/(routes)/tutor/courses/[courseId]/_components/description-form'
import { ImageForm } from '@/app/(dashboard)/(routes)/tutor/courses/[courseId]/_components/image-form'
import { SubjectForm } from '@/app/(dashboard)/(routes)/tutor/courses/[courseId]/_components/subject-form'
import { SessionlinkForm } from '@/app/(dashboard)/(routes)/tutor/courses/[courseId]/_components/sessionlink-form'
import { SessiontimeForm } from '@/app/(dashboard)/(routes)/tutor/courses/[courseId]/_components/sessiontime'
import { AttachmentForm } from '@/app/(dashboard)/(routes)/tutor/courses/[courseId]/_components/attachment-form'
import { AttachmentlinkForm } from '@/app/(dashboard)/(routes)/tutor/courses/[courseId]/_components/attachmentlink-form'
import { ChaptersForm } from '@/app/(dashboard)/(routes)/tutor/courses/[courseId]/_components/chapters-form'
import { BoardForm } from '@/app/(dashboard)/(routes)/tutor/courses/[courseId]/_components/board-form'
import { Banner } from '@/components/banner'
import { isSuperAdmin } from '@/lib/admin'
import { ArrowLeft, LayoutDashboard, Play, File, ListVideo } from 'lucide-react'
import Link from 'next/link'

const SuperAdminCourseEditPage = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = auth()
  if (!userId) return redirect('/dashboard')
  if (!isSuperAdmin(userId)) return redirect('/dashboard')

  // Fetch course with chapters (no userId filter)
  const course = await db.course.findUnique({
    where: { id: params.courseId },
    include: {
      chapters: { orderBy: { position: 'asc' } },
      attachments: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!course) return redirect('/search-courses')

  const subjects = await db.subject.findMany({ orderBy: { name: 'asc' } })
  const boards = await db.board.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between ">
        <div className="w-full">
          <Link
            href={`/search-courses`}
            className="flex items-center text-sm hover:opacity-75 transition mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to courses
          </Link>
          <div className="flex items-center justify-between w-full">
            <div className="flex-col flex gap-y-2">
              <h1 className="text-2xl font-medium">Super Admin: Edit Course</h1>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl">Customize your course</h2>
              </div>
              <TitleForm initialData={course} courseId={course.id} />
              <DescriptionForm initialData={course} courseId={course.id} />
              <ImageForm initialData={course} courseId={course.id} />
              <SubjectForm
                initialData={course}
                courseId={course.id}
                options={subjects.map((subject) => ({
                  label: subject.name,
                  value: subject.id,
                }))}
              />
              <BoardForm
                initialData={course}
                courseId={course.id}
                options={boards.map((board) => ({
                  label: board.name,
                  value: board.id,
                }))}
              />
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-x-2">
                <IconBadge icon={Play} />
                <h2 className="text-xl">Intro Meeting</h2>
                <span className="text-sm text-slate-500">(optional)</span>
              </div>
              <div>
                <SessionlinkForm initialData={course} courseId={course.id} />
                <SessiontimeForm
                  initialData={{
                    sessiondate: course.sessiondate === null ? undefined : course.sessiondate,
                    sessiontime: course.sessiontime === null ? undefined : course.sessiontime,
                  }}
                  courseId={course.id}
                />
              </div>
              <div>
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={File} />
                  <h2 className="text-xl">Resources</h2>
                  <span className="text-sm text-slate-500">(optional)</span>
                </div>
                <div>
                  <AttachmentForm initialData={course} courseId={course.id} />
                  <AttachmentlinkForm initialData={course} courseId={course.id} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={ListVideo} />
                  <h2 className="text-xl">
                    Course Chapters{' '}
                    <p className="text-sm text-slate-500">
                      You can also add all your meetings as chapters
                    </p>
                  </h2>
                </div>
                <div>
                  <ChaptersForm initialData={course} courseId={course.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminCourseEditPage 