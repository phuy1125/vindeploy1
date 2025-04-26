import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base text-green-900 font-medium ">Welcome to the admin of VintelliTour</h1>
        <div className="ml-auto text-black bg-black flex items-center gap-2 rounded-xl">
            <Button 
          variant="ghost" 
          asChild 
          size="sm" 
          className="hidden sm:flex rounded-xl p-2 hover:bg-transparent"
        >
          <a
            href="https://github.com/minhloc289/VintelliTour"
            rel="noopener noreferrer"
            target="_blank"
            className="flex items-center gap-2 text-white font-semibold py-2 px-4 rounded-xl hover:bg-teal-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md border border-teal-200 hover:border-transparent"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.839 21.489C9.339 21.581 9.521 21.284 9.521 21.021C9.521 20.784 9.513 20.133 9.508 19.289C6.726 19.882 6.139 17.891 6.139 17.891C5.685 16.735 5.029 16.439 5.029 16.439C4.132 15.798 5.095 15.81 5.095 15.81C6.089 15.88 6.616 16.852 6.616 16.852C7.5 18.423 8.969 17.938 9.539 17.683C9.631 17.029 9.889 16.545 10.175 16.26C7.954 15.972 5.62 15.085 5.62 11.333C5.62 10.249 6.01 9.358 6.636 8.659C6.533 8.409 6.186 7.406 6.736 6.061C6.736 6.061 7.566 5.795 9.497 7.061C10.2958 6.83886 11.1246 6.72614 11.959 6.726C12.792 6.73 13.646 6.853 14.42 7.061C16.349 5.794 17.179 6.061 17.179 6.061C17.729 7.406 17.384 8.409 17.279 8.659C17.908 9.358 18.294 10.249 18.294 11.333C18.294 15.095 15.955 15.969 13.728 16.252C14.081 16.598 14.394 17.281 14.394 18.334C14.394 19.836 14.383 20.691 14.383 21.021C14.383 21.286 14.562 21.585 15.072 21.488C19.042 20.162 21.904 16.417 21.904 12C21.904 6.477 17.428 2 12 2Z" />
            </svg>
            GitHub
          </a>
            </Button>

        </div>
      </div>
    </header>
  )
}
